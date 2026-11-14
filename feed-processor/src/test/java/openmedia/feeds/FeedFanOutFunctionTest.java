package openmedia.feeds;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.apache.flink.api.common.typeinfo.Types;
import org.apache.flink.streaming.api.operators.KeyedProcessOperator;
import org.apache.flink.streaming.util.KeyedOneInputStreamOperatorTestHarness;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FeedFanOutFunctionTest {

	private static final int AUTHOR = 1;

	private KeyedOneInputStreamOperatorTestHarness<Integer, Keyed<FeedEvent, Integer>, FeedEntry> harness;

	@BeforeEach
	void setUp() throws Exception {
		harness = new KeyedOneInputStreamOperatorTestHarness<>(
				new KeyedProcessOperator<>(new FeedFanOutFunction()), Keyed::getKey, Types.INT);
		harness.open();
	}

	private void send(FeedEvent event) throws Exception {
		harness.processElement(new Keyed<>(event, event.authorID(), DynamicKeyFunction.BY_AUTHOR), event.timestamp());
	}

	@Test
	void fansPostOutToFollowers() throws Exception {
		send(FeedEvent.followshipCreated(AUTHOR, 10, 100));
		send(FeedEvent.followshipCreated(AUTHOR, 11, 101));
		send(FeedEvent.postCreated(AUTHOR, 500, 200));
		harness.processWatermark(1_000);

		assertEquals(
				List.of(new FeedEntry(10, 500, AUTHOR, 200), new FeedEntry(11, 500, AUTHOR, 200)),
				harness.extractOutputValues().stream().sorted((a, b) -> a.consumerID() - b.consumerID()).toList());
	}

	@Test
	void reordersOutOfOrderEventsByEventTime() throws Exception {
		// The post (t=200) arrives before the follow (t=100) it was committed after.
		send(FeedEvent.postCreated(AUTHOR, 500, 200));
		send(FeedEvent.followshipCreated(AUTHOR, 10, 100));
		harness.processWatermark(1_000);

		assertEquals(List.of(new FeedEntry(10, 500, AUTHOR, 200)), harness.extractOutputValues());
	}

	@Test
	void stopsFanningOutAfterUnfollow() throws Exception {
		send(FeedEvent.followshipCreated(AUTHOR, 10, 100));
		send(FeedEvent.followshipDeleted(AUTHOR, 10, 150));
		send(FeedEvent.postCreated(AUTHOR, 500, 200));
		harness.processWatermark(1_000);

		assertEquals(List.of(), harness.extractOutputValues());
	}

	@Test
	void processesLateEventsImmediately() throws Exception {
		send(FeedEvent.followshipCreated(AUTHOR, 10, 100));
		harness.processWatermark(1_000);

		send(FeedEvent.postCreated(AUTHOR, 500, 900));

		assertEquals(List.of(new FeedEntry(10, 500, AUTHOR, 900)), harness.extractOutputValues());
	}
}
