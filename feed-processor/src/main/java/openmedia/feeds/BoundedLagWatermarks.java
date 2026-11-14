package openmedia.feeds;

import org.apache.flink.api.common.eventtime.Watermark;
import org.apache.flink.api.common.eventtime.WatermarkGenerator;
import org.apache.flink.api.common.eventtime.WatermarkOutput;

/**
 * Bounded out-of-orderness watermarks, which also keep advancing while a stream is idle.
 *
 * <p>Event timestamps are transaction commit times, so they track the wall clock. A plain bounded
 * out-of-orderness generator only advances on new events : a post created while nobody else is
 * posting / following would sit in the buffer of {@link FeedFanOutFunction} until the next event
 * arrives. Using the wall clock as a lower bound for the watermark avoids that. An event arriving
 * later than the bound gets treated as late, and is processed right away.
 */
public class BoundedLagWatermarks implements WatermarkGenerator<FeedEvent> {

	private final long maxOutOfOrdernessMillis;

	private long maxTimestamp = Long.MIN_VALUE;

	public BoundedLagWatermarks(long maxOutOfOrdernessMillis) {
		this.maxOutOfOrdernessMillis = maxOutOfOrdernessMillis;
	}

	@Override
	public void onEvent(FeedEvent event, long eventTimestamp, WatermarkOutput output) {
		maxTimestamp = Math.max(maxTimestamp, eventTimestamp);
	}

	@Override
	public void onPeriodicEmit(WatermarkOutput output) {
		long upperBound = Math.max(maxTimestamp, System.currentTimeMillis());
		output.emitWatermark(new Watermark(upperBound - maxOutOfOrdernessMillis - 1));
	}
}
