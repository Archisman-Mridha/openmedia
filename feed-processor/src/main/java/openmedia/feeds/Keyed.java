package openmedia.feeds;

/**
 * An event wrapped together with the key it is partitioned by.
 *
 * <p>This is the {@code Keyed<IN, KEY, ID>} wrapper from the dynamic data partitioning pattern
 * (Advanced Flink Application Patterns, part 1) : the key is computed at runtime by
 * {@link DynamicKeyFunction} instead of being hard-coded into {@code keyBy}, so events of
 * different types (coming from different streams) can be routed to the same partition.
 */
public class Keyed<IN, KEY> {

	public IN wrapped;
	public KEY key;
	public String partitioningRule;

	public Keyed() {}

	public Keyed(IN wrapped, KEY key, String partitioningRule) {
		this.wrapped = wrapped;
		this.key = key;
		this.partitioningRule = partitioningRule;
	}

	public KEY getKey() {
		return key;
	}
}
