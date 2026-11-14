package openmedia.feeds;

import java.sql.Timestamp;
import java.time.Duration;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.typeinfo.TypeHint;
import org.apache.flink.api.common.typeinfo.Types;
import org.apache.flink.connector.jdbc.JdbcConnectionOptions;
import org.apache.flink.connector.jdbc.JdbcExecutionOptions;
import org.apache.flink.connector.jdbc.core.datastream.sink.JdbcSink;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

/**
 * Reads followship (created / deleted) and post (created) change events, and writes each new post
 * into the feeds of the followers of its author.
 */
public class FeedProcessorJob {

	static final String TOPIC_FOLLOWSHIPS_CREATED = "events.followships.created";
	static final String TOPIC_FOLLOWSHIPS_DELETED = "events.followships.deleted";
	static final String TOPIC_POSTS_CREATED = "events.posts.created";

	static final String CONSUMER_GROUP_ID = "feed-processor";

	static final Duration MAX_OUT_OF_ORDERNESS = Duration.ofSeconds(2);

	public static void main(String[] args) throws Exception {
		StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

		// Kafka offsets get committed, and the feeds sink gets flushed, on checkpoints.
		env.enableCheckpointing(Duration.ofSeconds(10).toMillis());

		WatermarkStrategy<FeedEvent> watermarkStrategy = WatermarkStrategy
				.<FeedEvent>forGenerator(context -> new BoundedLagWatermarks(MAX_OUT_OF_ORDERNESS.toMillis()))
				.withTimestampAssigner((event, recordTimestamp) -> event.timestamp());

		DataStream<FeedEvent> followships = env.fromSource(
				kafkaSource(TOPIC_FOLLOWSHIPS_CREATED, TOPIC_FOLLOWSHIPS_DELETED),
				watermarkStrategy, "followships");

		DataStream<FeedEvent> posts = env.fromSource(
				kafkaSource(TOPIC_POSTS_CREATED), watermarkStrategy, "posts");

		DataStream<FeedEntry> feedEntries = followships
				.union(posts)
				.flatMap(new DynamicKeyFunction())
				.returns(new TypeHint<Keyed<FeedEvent, Integer>>() {})
				.name("dynamic-key")
				.keyBy(Keyed::getKey, Types.INT)
				.process(new FeedFanOutFunction())
				.name("feed-fan-out");

		feedEntries.sinkTo(feedsSink()).name("feeds");

		env.execute("feed-processor");
	}

	private static KafkaSource<FeedEvent> kafkaSource(String... topics) {
		String saslMechanism = System.getenv().getOrDefault("KAFKA_SASL_MECHANISM", "PLAIN");
		String loginModule = saslMechanism.equals("PLAIN")
				? "org.apache.kafka.common.security.plain.PlainLoginModule"
				: "org.apache.kafka.common.security.scram.ScramLoginModule";
		String jaasConfig = String.format("%s required username=\"%s\" password=\"%s\";",
				loginModule, requiredEnv("KAFKA_USERNAME"), requiredEnv("KAFKA_PASSWORD"));

		return KafkaSource.<FeedEvent>builder()
				.setBootstrapServers(requiredEnv("KAFKA_BROKERS"))
				.setTopics(topics)
				.setGroupId(CONSUMER_GROUP_ID)
				.setStartingOffsets(OffsetsInitializer.committedOffsets(
						org.apache.kafka.clients.consumer.OffsetResetStrategy.EARLIEST))
				.setValueOnlyDeserializer(new DebeziumEventDeserializer())
				.setProperty("security.protocol", "SASL_PLAINTEXT")
				.setProperty("sasl.mechanism", saslMechanism)
				.setProperty("sasl.jaas.config", jaasConfig)
				.build();
	}

	private static JdbcSink<FeedEntry> feedsSink() {
		// The feeds table has a unique (consumer_id, post_id) constraint. So, replaying events after
		// a restart doesn't duplicate feed entries.
		String query = "INSERT INTO feeds (consumer_id, post_id, post_author_id, post_created_at) "
				+ "VALUES (?, ?, ?, ?) ON CONFLICT (consumer_id, post_id) DO NOTHING";

		return JdbcSink.<FeedEntry>builder()
				.withQueryStatement(query, (statement, entry) -> {
					statement.setInt(1, entry.consumerID());
					statement.setInt(2, entry.postID());
					statement.setInt(3, entry.postAuthorID());
					statement.setTimestamp(4, new Timestamp(entry.postCreatedAt()));
				})
				.withExecutionOptions(JdbcExecutionOptions.builder()
						.withBatchSize(500)
						.withBatchIntervalMs(200)
						.withMaxRetries(3)
						.build())
				.buildAtLeastOnce(new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
						.withUrl(requiredEnv("POSTGRES_URL"))
						.withDriverName("org.postgresql.Driver")
						.withUsername(requiredEnv("POSTGRES_USER"))
						.withPassword(requiredEnv("POSTGRES_PASSWORD"))
						.build());
	}

	private static String requiredEnv(String name) {
		String value = System.getenv(name);
		if (value == null || value.isEmpty()) {
			throw new IllegalStateException("Environment variable " + name + " is not set");
		}
		return value;
	}
}
