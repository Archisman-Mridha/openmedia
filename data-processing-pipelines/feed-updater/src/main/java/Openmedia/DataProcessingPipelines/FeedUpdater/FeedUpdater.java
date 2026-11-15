package Openmedia.DataProcessingPipelines.FeedUpdater;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.apache.flink.connector.jdbc.JdbcExactlyOnceOptions;
import org.apache.flink.connector.jdbc.core.datastream.sink.JdbcSink;
import org.apache.flink.formats.json.debezium.DebeziumJsonFormatOptions;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.table.KafkaConnectorOptions;
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.FormatDescriptor;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.apache.flink.table.api.config.ExecutionConfigOptions;
import org.apache.flink.types.RowKind;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.security.auth.SecurityProtocol;
import org.apache.kafka.common.security.plain.PlainLoginModule;
import org.postgresql.xa.PGXADataSource;

/*
  (1) DataStream API

    DataStream programs in Flink are regular programs that implement transformations on data
    streams (e.g., filtering, updating state, defining windows, aggregating). The data streams are
    initially created from various sources (e.g., message queues, socket streams, files). Results
    are returned via sinks, which may for example write the data to files, or to standard output
    (for example the command line terminal). Flink programs run in a variety of contexts,
    standalone, or embedded in other programs. The execution can happen in a local JVM, or on
    clusters of many machines.

    The DataStream API gets its name from the special DataStream class that is used to represent a
    collection of data in a Flink program. You can think of them as immutable collections of data
    that can contain duplicates. This data can either be finite or unbounded, the API that you use
    to work on them is the same.

    A DataStream is similar to a regular Java Collection in terms of usage but is quite different
    in some key ways. They are immutable, meaning that once they are created you cannot add or
    remove elements. You can also not simply inspect the elements inside but only work on them
    using the DataStream API operations, which are also called transformations.

    You can create an initial DataStream by adding a source in a Flink program. Then you can derive
    new streams from this and combine them by using API methods such as map, filter, and so on.

  (2) Table API and SQL

    Apache Flink features two relational APIs - the Table API and SQL - for unified stream and
    batch processing. The Table API is a language-integrated query API for Java, Scala, and Python
    that allows the composition of queries from relational operators such as selection, filter, and
    join in a very intuitive way. Flink’s SQL support is based on Apache Calcite which implements
    the SQL standard. Queries specified in either interface have the same semantics and specify the
    same result regardless of whether the input is continuous (streaming) or bounded (batch).

    The Table API and SQL interfaces integrate seamlessly with each other and Flink’s DataStream
    API. You can easily switch between all APIs and libraries which build upon them.

  Both Table API and DataStream API are equally important when it comes to defining a data
  processing pipeline.

  The DataStream API offers the primitives of stream processing (namely time, state, and dataflow
  management) in a relatively low-level imperative programming API. The Table API abstracts away
  many internals and provides a structured and declarative API.

  Both APIs can work with bounded and unbounded streams.

  Bounded streams need to be managed when processing historical data. Unbounded streams occur in
  real-time processing scenarios that might be initialized with historical data first.

  For efficient execution, both APIs offer processing bounded streams in an optimized batch
  execution mode. However, since batch is just a special case of streaming, it is also possible to
  run pipelines of bounded streams in regular streaming execution mode.

  Pipelines in one API can be defined end-to-end without dependencies on the other API. However, it
  might be useful to mix both APIs for various reasons
*/
public class FeedUpdater {
  private static final String JOB_NAME = "feed_updater";

  private static final String KAFKA_CONSUMER_GROUP_ID = "feed_updater";

  private static final class ColumnName {
    private static final String FOLLOWER_ID = "follower_id";
    private static final String FOLLOWEE_ID = "followee_id";

    private static final String ID = "id";
    private static final String AUTHOR_ID = "author_id";
    private static final String CREATED_AT = "created_at";
  }

  private static final class DataStreamName {
    private static final String FOLLOWSHIP_CHANGES = "followship_changes";

    private static final String CREATED_POSTS = "created_posts";
  }

  private static final class KafkaTopic {
    private static final String EVENTS_FOLLOWSHIPS = "events.followships";

    private static final String EVENTS_POSTS_CREATED = "events.posts.created";
  }

  private record FollowshipChange(RowKind kind, int followerID, int followeeID) {}

  public record CreatedPost(int postID, int authorID, Instant createdAt) {}

  private record FeedEntity(int consumerID, int postID, int postAuthorID, Instant postCreatedAt) {}

  public static void main(String[] args) throws Exception {
    /*
      The StreamExecutionEnvironment is the basis for all Flink programs.
    
      Typically, you only need to use getExecutionEnvironment(), since this will do the right
      thing depending on the context: if you are executing your program inside an IDE or as a
      regular Java program it will create a local environment that will execute your program on
      your local machine. If you created a JAR file from your program, and invoke it through the
      command line, the Flink cluster manager will execute your main method and
      getExecutionEnvironment() will return an execution environment for executing your program on
      a cluster.
    */
    final StreamExecutionEnvironment executionEnvironment = StreamExecutionEnvironment.getExecutionEnvironment();
    final StreamTableEnvironment executionEnvironmentTableAPI = StreamTableEnvironment.create(executionEnvironment);
    //
    // Under normal operating scenarios, the Debezium application delivers every change event
    // exactly-once. Flink works pretty well when consuming Debezium produced events in this
    // situation. However, Debezium application works in at-least-once delivery if any failover
    // happens. See more details about delivery guarantee from Debezium documentation. That means,
    // in the abnormal situations, Debezium may deliver duplicate change events to Kafka and Flink
    // will get the duplicate events. This may cause Flink query to get wrong results or unexpected
    // exceptions. Thus, it is recommended to set job configuration
    // table.exec.source.cdc-events-duplicate to true and define PRIMARY KEY on the source in this
    // situation. Framework will generate an additional stateful operator, and use the primary key
    // to deduplicate the change events and produce a normalized changelog stream.
    executionEnvironmentTableAPI.getConfig().set(ExecutionConfigOptions.TABLE_EXEC_SOURCE_CDC_EVENTS_DUPLICATE, true);

    // Construct the followship changes source connector.

    final Schema followshipSchema = Schema.newBuilder()
      .column(ColumnName.ID, DataTypes.INT().notNull())
      .column(ColumnName.FOLLOWER_ID, DataTypes.INT().notNull())
      .column(ColumnName.FOLLOWEE_ID, DataTypes.INT().notNull())
      // Suppose user A follows, unfollows and then again follows user B. These events should be
      // processed in order on the same physical instance.
      .primaryKey(ColumnName.FOLLOWER_ID, ColumnName.FOLLOWEE_ID)
      .build();

    final DataStream<FollowshipChange> followshipChanges = executionEnvironmentTableAPI.toChangelogStream(
      executionEnvironmentTableAPI.from(
        createKafkaSource(
          List.of(KafkaTopic.EVENTS_FOLLOWSHIPS),
          followshipSchema
        )
      )
    )
      .map(
        row -> new FollowshipChange(
          row.getKind(),
          row.<Integer>getFieldAs(ColumnName.FOLLOWER_ID),
          row.<Integer>getFieldAs(ColumnName.FOLLOWEE_ID)
        )
      )
      .name(DataStreamName.FOLLOWSHIP_CHANGES);

    // Construct the created post events source connector.

    final Schema postSchema = Schema.newBuilder()
      .column(ColumnName.ID, DataTypes.INT().notNull())
      .column(ColumnName.AUTHOR_ID, DataTypes.INT().notNull())
      .column(ColumnName.CREATED_AT, DataTypes.TIMESTAMP_LTZ(3))
      .primaryKey(ColumnName.ID)
      .build();

    final DataStream<CreatedPost> createdPosts = executionEnvironmentTableAPI.toChangelogStream(
      executionEnvironmentTableAPI.from(
        createKafkaSource(
          List.of(KafkaTopic.EVENTS_POSTS_CREATED),
          postSchema
        )
      )
    )
      .map(
        row -> new CreatedPost(
          row.<Integer>getFieldAs(ColumnName.ID),
          row.<Integer>getFieldAs(ColumnName.AUTHOR_ID),
          row.<Instant>getFieldAs(ColumnName.CREATED_AT)
        )
      )
      .name(DataStreamName.CREATED_POSTS);

    // Create the feeds sink connector.

    final JdbcSink<FeedEntity> feedsSink = JdbcSink.<FeedEntity>builder()
      .withQueryStatement(
        """
            INSERT INTO feeds (consumer_id, post_id, post_author_id, post_created_at) VALUES (?, ?, ?, ?)
            ON CONFLICT (consumer_id, post_id) DO NOTHING
          """,
        (statement, feed) -> {
          statement.setInt(1, feed.consumerID());
          statement.setInt(2, feed.postID());
          statement.setInt(3, feed.postAuthorID());
          statement.setTimestamp(4, Timestamp.from(feed.postCreatedAt()));
        }
      )
      // Since 1.13, Flink JDBC sink supports exactly-once mode. The implementation relies on the
      // JDBC driver support of XA standard.
      .buildExactlyOnce(
        JdbcExactlyOnceOptions.defaults(),
        () -> {
          final PGXADataSource dataSource = new PGXADataSource();
          dataSource.setUrl(getRequiredEnv("POSTGRES_URL"));
          dataSource.setUser(getRequiredEnv("POSTGRES_USER"));
          dataSource.setPassword(getRequiredEnv("POSTGRES_PASSWORD"));
          return dataSource;
        }
      );

    // Keying a stream shuffles all the records such that elements with the same key are assigned
    // to the same partition. This means all records with the same key are processed by the same
    // physical instance of the next operator.
    followshipChanges.keyBy(FollowshipChange::followeeID)
      /*
        “Connects” two data streams retaining their types. Connect allowing for shared state
        between the two streams.
      
        ConnectedStreams represent two connected streams of (possibly) different data types.
        Connected streams are useful for cases where operations on one stream directly affect the
        operations on the other stream, usually via shared state between the streams.
      
        An example for the use of connected streams would be to apply rules that change over time
        onto another stream. One of the connected streams has the rules, the other stream the
        elements to apply the rules to. The operation on the connected stream maintains the
        current set of rules in the state. It may receive either a rule update and update the
        state or a data element and apply the rules in the state to the element.
      
        The connected stream can be conceptually viewed as a union stream of an Either type, that
        holds either the first stream's type or the second stream's type.
      */
      .connect(createdPosts.keyBy(CreatedPost::authorID))
      .process(ConnectedStreamsProcessor);

    executionEnvironment.execute(JOB_NAME);
  }

  // Processes the 2 connected streams : followship changes, and created posts.
  private static class ConnectedStreamsProcessor {
  }

  // Returns a Kafka based source reading from the given topics.
  private static TableDescriptor createKafkaSource(List<String> topics, Schema schema) throws IllegalStateException {
    final String kafkaBrokerAddresses = getRequiredEnv("KAFKA_BROKER_ADDRESSES"),

      kafkaUsername = getRequiredEnv("KAFKA_USERNAME"),
      kafkaPassword = getRequiredEnv("KAFKA_PASSWORD");

    final String saslJAASConfig = String.format(
      "%s required username=\"%s\" password=\"%s\";",
      PlainLoginModule.class.getName(), kafkaUsername, kafkaPassword
    );

    TableDescriptor.Builder kafkaSourceBuilder = TableDescriptor.forConnector("kafka")
      .option(KafkaConnectorOptions.TOPIC.key(), String.join(";", topics))
      .option(KafkaConnectorOptions.PROPS_BOOTSTRAP_SERVERS, kafkaBrokerAddresses)
      .option(KafkaConnectorOptions.PROPS_GROUP_ID, KAFKA_CONSUMER_GROUP_ID)
      .option("properties.security.protocol", "SASL_PLAINTEXT")
      .option("properties.sasl.mechanism", "PLAIN")
      .format(
        FormatDescriptor.forFormat("debezium-json")
          .option(DebeziumJsonFormatOptions.TIMESTAMP_FORMAT, "ISO-8601")
          .build()
      );

    final Map<String, String> moreKafkaClientOptions = Map.of(
      // Protocol used to communicate with brokers.
      CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, SecurityProtocol.SASL_PLAINTEXT.name,

      // SASL mechanism used for client connections. This may be any mechanism for which a
      // security provider is available. GSSAPI is the default mechanism.
      SaslConfigs.SASL_MECHANISM, "PLAIN",

      // JAAS login context parameters for SASL connections in the format used by JAAS
      // configuration files.
      // Refer here for the JAAS configuration file format :
      // https://docs.oracle.com/javase/8/docs/technotes/guides/security/jgss/tutorials/LoginConfigFile.html.
      SaslConfigs.SASL_JAAS_CONFIG, saslJAASConfig,

      // What to do when there is no initial offset in Kafka or if the current offset does not
      // exist any more on the server (e.g. because that data has been deleted).
      ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"
    );
    moreKafkaClientOptions.forEach((option, value) -> kafkaSourceBuilder.option(option, value));

    final TableDescriptor kafkaSource = kafkaSourceBuilder.schema(schema).build();
    return kafkaSource;
  }

  // Returns value of the given environment variable.
  // Throws illegal state exception, if the environment variable isn't defined or has an empty
  // value.
  private static String getRequiredEnv(String name) throws IllegalStateException {
    final String value = System.getenv(name);
    if (value == null || value.isEmpty())
      throw new IllegalStateException(String.format("Environment variable %s not found", name));

    return value;
  }
}
