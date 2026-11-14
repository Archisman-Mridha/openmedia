package openmedia.feeds;

import java.util.ArrayList;
import java.util.List;
import org.apache.flink.api.common.functions.OpenContext;
import org.apache.flink.api.common.state.MapState;
import org.apache.flink.api.common.state.MapStateDescriptor;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.common.typeinfo.Types;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;

/**
 * Keeps the followers of an author, and fans each post of that author out to their feeds.
 *
 * <p>Follow / unfollow and post events come from different Kafka topics, so they can arrive out of
 * order : a post written right after a follow could be processed before it, and miss the new
 * follower. Instead of windows, this uses the custom window processing pattern (Advanced Flink
 * Application Patterns, part 3) : events are buffered in keyed {@link MapState}, indexed by event
 * time, and an event time timer releases them, in timestamp order, once the watermark passes. The
 * buffer entry is cleared right after, so state only holds what is still in flight plus the
 * follower set.
 */
public class FeedFanOutFunction
		extends KeyedProcessFunction<Integer, Keyed<FeedEvent, Integer>, FeedEntry> {

	// Event timestamp -> events of this author with that timestamp, waiting for the watermark.
	private transient MapState<Long, List<FeedEvent>> buffer;

	// Follower ID -> (unused). Used as a set.
	private transient MapState<Integer, Boolean> followers;

	@Override
	public void open(OpenContext openContext) {
		buffer = getRuntimeContext().getMapState(new MapStateDescriptor<>(
				"buffer", Types.LONG, Types.LIST(TypeInformation.of(FeedEvent.class))));

		followers = getRuntimeContext().getMapState(
				new MapStateDescriptor<>("followers", Types.INT, Types.BOOLEAN));
	}

	@Override
	public void processElement(Keyed<FeedEvent, Integer> keyed, Context ctx, Collector<FeedEntry> out)
			throws Exception {
		FeedEvent event = keyed.wrapped;
		long timestamp = event.timestamp();

		// Late event : the events around it have been released already, so there's nothing left to
		// order it against.
		if (timestamp <= ctx.timerService().currentWatermark()) {
			apply(event, out);
			return;
		}

		List<FeedEvent> events = buffer.get(timestamp);
		if (events == null) {
			events = new ArrayList<>();
		}
		events.add(event);
		buffer.put(timestamp, events);

		ctx.timerService().registerEventTimeTimer(timestamp);
	}

	@Override
	public void onTimer(long timestamp, OnTimerContext ctx, Collector<FeedEntry> out) throws Exception {
		List<FeedEvent> events = buffer.get(timestamp);
		if (events == null) {
			return;
		}

		// For events committed at the same millisecond, apply followship changes before posts.
		events.sort((a, b) -> Boolean.compare(
				a.type() == FeedEvent.Type.POST_CREATED, b.type() == FeedEvent.Type.POST_CREATED));
		for (FeedEvent event : events) {
			apply(event, out);
		}

		buffer.remove(timestamp);
	}

	private void apply(FeedEvent event, Collector<FeedEntry> out) throws Exception {
		switch (event.type()) {
			case FOLLOWSHIP_CREATED -> followers.put(event.followerID(), true);

			case FOLLOWSHIP_DELETED -> followers.remove(event.followerID());

			case POST_CREATED -> {
				for (Integer followerID : followers.keys()) {
					out.collect(new FeedEntry(followerID, event.postID(), event.authorID(), event.timestamp()));
				}
			}
		}
	}
}
