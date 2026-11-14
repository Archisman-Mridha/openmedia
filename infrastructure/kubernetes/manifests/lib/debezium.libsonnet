/*
  Debezium is a set of distributed services to capture changes in your databases so that your
  applications can see those changes and respond to them. Debezium records all row-level changes
  within each database table in a change event stream, and applications simply read these streams
  to see the change events in the same order in which they occurred.

  Debezium is built on top of Apache Kafka and provides a set of Kafka Connect compatible
  connectors. Each of the connectors works with a specific database management system (DBMS).
  Connectors record the history of data changes in the DBMS by detecting changes as they occur,
  and streaming a record of each change event to a Kafka topic. Consuming applications can then
  read the resulting event records from the Kafka topic.

  Most commonly, you deploy Debezium by means of Apache Kafka Connect. Kafka Connect is a
  framework and runtime for implementing and operating:

    (1) Source connectors such as Debezium that send records into Kafka

    (2) Sink connectors that propagate records from Kafka topics to other systems
*/
local newConnectCluster = function(
  name,
  namespace,
  kafkaClusterName,
  kafkaUserName,
  groupID,
  outputImage,
  pushSecretName,
  env
                          ) {
  apiVersion: 'kafka.strimzi.io/v1',
  kind: 'KafkaConnect',
  metadata: {
    name: name,
    namespace: namespace,
    annotations: {
      'strimzi.io/use-connector-resources': 'true',
    },
  },
  spec: {
    version: '4.2.0',
    replicas: 1,

    bootstrapServers: std.format('%s-kafka-bootstrap:9092', kafkaClusterName),
    authentication: {
      type: 'scram-sha-512',
      username: kafkaUserName,
      passwordSecret: {
        secretName: kafkaUserName,
        password: 'password',
      },
    },

    groupId: groupID,
    configStorageTopic: std.format('%s.configs', groupID),
    offsetStorageTopic: std.format('%s.offsets', groupID),
    statusStorageTopic: std.format('%s.statuses', groupID),

    config: {
      'config.storage.replication.factor': -1,
      'offset.storage.replication.factor': -1,
      'status.storage.replication.factor': -1,

      'key.converter': 'org.apache.kafka.connect.json.JsonConverter',
      'key.converter.schemas.enable': true,
      'value.converter': 'org.apache.kafka.connect.json.JsonConverter',
      'value.converter.schemas.enable': true,

      'config.providers': 'env',
      'config.providers.env.class': 'org.apache.kafka.common.config.provider.EnvVarConfigProvider',
    },

    build: {
      output: {
        type: 'docker',
        image: outputImage,
        pushSecret: pushSecretName,
      },
      plugins: [{
        name: 'debezium-connector-postgres',
        artifacts: [{
          type: 'tgz',
          url: 'https://repo1.maven.org/maven2/io/debezium/debezium-connector-postgres/3.7.1.Final/debezium-connector-postgres-3.7.1.Final-plugin.tar.gz',
          sha512sum: 'd118c8eb994153c9cb687ee9071d09d07b5a03aafc03f5d898bd8ffa86ba801342be30723736f8d2803ae4a708a33295335f54d9f1af99d8c348461579a85868',
        }],
      }],
    },

    template: {
      connectContainer: {
        env: env,
      },
    },
  },
};

local newConnector = function(name, namespace, connectClusterName, config) {
  apiVersion: 'kafka.strimzi.io/v1',
  kind: 'KafkaConnector',
  metadata: {
    name: name,
    namespace: namespace,
    labels: {
      'strimzi.io/cluster': connectClusterName,
    },
  },
  spec: {
    class: config['connector.class'],
    tasksMax: 1,
    config: std.objectRemoveKey(config, 'connector.class'),
  },
};

{
  newConnectCluster:: newConnectCluster,
  newConnector:: newConnector,
}
