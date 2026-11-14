FROM gradle:8.14.4-jdk21 AS builder
WORKDIR /home/gradle/feed-processor
COPY settings.gradle.kts build.gradle.kts ./
COPY src src
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
  gradle --no-daemon shadowJar

FROM flink:2.2.1-java21
COPY --from=builder /home/gradle/feed-processor/build/libs/feed-processor.jar /opt/flink/usrlib/feed-processor.jar
