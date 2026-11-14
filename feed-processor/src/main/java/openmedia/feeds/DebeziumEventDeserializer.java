package openmedia.feeds;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.apache.flink.api.common.serialization.DeserializationSchema;
import org.apache.flink.api.common.typeinfo.TypeInformation;

/**
 * Parses Debezium change events (JSON converter, with schemas enabled) into {@link FeedEvent}s.
 *
 * <p>Change events of the {@code followships} and {@code posts} tables are told apart by the
 * columns present, and creates from deletes by Debezium's {@code op}.
 */
public class DebeziumEventDeserializer implements DeserializationSchema<FeedEvent> {

	private transient ObjectMapper objectMapper;

	@Override
	public void open(InitializationContext context) {
		objectMapper = new ObjectMapper();
	}

	@Override
	public FeedEvent deserialize(byte[] message) throws IOException {
		// Tombstones.
		if (message == null) {
			return null;
		}

		JsonNode payload = objectMapper.readTree(message).path("payload");
		long timestamp = payload.path("source").path("ts_ms").asLong();

		switch (payload.path("op").asText()) {
			case "c": {
				JsonNode row = payload.path("after");
				if (row.has("followee_id")) {
					return FeedEvent.followshipCreated(
							row.get("followee_id").asInt(), row.get("follower_id").asInt(), timestamp);
				}
				return FeedEvent.postCreated(row.get("author_id").asInt(), row.get("id").asInt(), timestamp);
			}

			case "d": {
				// Requires REPLICA IDENTITY FULL on the followships table.
				JsonNode row = payload.path("before");
				return FeedEvent.followshipDeleted(
						row.get("followee_id").asInt(), row.get("follower_id").asInt(), timestamp);
			}

			// Skipped by the Debezium connectors already.
			default:
				return null;
		}
	}

	@Override
	public boolean isEndOfStream(FeedEvent nextElement) {
		return false;
	}

	@Override
	public TypeInformation<FeedEvent> getProducedType() {
		return TypeInformation.of(FeedEvent.class);
	}
}
