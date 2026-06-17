/*
  Redpanda is an event streaming platform: it provides the infrastructure for streaming real-time
  data.

  Producers are client applications that send data to Redpanda in the form of events. Redpanda
  safely stores these events in sequence and organizes them into topics, which represent a
  replayable log of changes in the system.

  Consumers are client applications that subscribe to Redpanda topics to asynchronously read
  events. Consumers can store, process, or react to the events.

  Redpanda decouples producers from consumers to allow for asynchronous event processing, event
  tracking, event manipulation, and event archiving. Producers and consumers interact with
  Redpanda using the Apache Kafka API.

  To scale topics, Redpanda shards them into one or more partitions that are distributed across the
  nodes in a cluster. This allows for concurrent writing and reading from multiple nodes. When
  producers write to a topic, they route events to one of the topic’s partitions. Events with the
  same key (like a stock ticker) are always routed to the same partition, and Redpanda guarantees
  the order of events at the partition level. Consumers read events from a partition in the order
  that they were written. If a key is not specified, then events are sent to all topic partitions
  in a round-robin fashion.
*/
{}
