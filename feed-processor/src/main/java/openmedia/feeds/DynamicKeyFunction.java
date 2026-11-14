package openmedia.feeds;

import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.util.Collector;

/**
 * Dynamic data partitioning (Advanced Flink Application Patterns, part 1).
 *
 * <p>Followship and post events arrive on different streams, with the author living in different
 * fields. This function extracts the partitioning key per event type, so that every event which
 * affects the feed fan-out of an author ends up in the same keyed partition, and therefore sees
 * the same follower state.
 */
public class DynamicKeyFunction implements FlatMapFunction<FeedEvent, Keyed<FeedEvent, Integer>> {

	static final String BY_AUTHOR = "by-author";

	@Override
	public void flatMap(FeedEvent event, Collector<Keyed<FeedEvent, Integer>> out) {
		out.collect(new Keyed<>(event, event.authorID(), BY_AUTHOR));
	}
}
