plugins {
	java
	id("com.gradleup.shadow") version "8.3.11"
}

group = "openmedia"
version = "0.0.1"

val flinkVersion = "2.2.1"

repositories {
	mavenCentral()
}

dependencies {
	// Provided by the Flink runtime (the flink Docker image).
	compileOnly("org.apache.flink:flink-streaming-java:$flinkVersion")
	compileOnly("org.apache.flink:flink-clients:$flinkVersion")

	implementation("org.apache.flink:flink-connector-kafka:5.0.0-2.2")
	implementation("org.apache.flink:flink-connector-jdbc-core:4.1.0-2.2")
	implementation("org.apache.flink:flink-connector-jdbc-postgres:4.1.0-2.2")
	implementation("org.postgresql:postgresql:42.7.14")
	implementation("com.fasterxml.jackson.core:jackson-databind:2.23.0")

	testImplementation("org.apache.flink:flink-streaming-java:$flinkVersion")
	testImplementation("org.apache.flink:flink-test-utils:$flinkVersion")
	testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<JavaCompile> {
	options.release = 21
}

tasks.test {
	useJUnitPlatform()
}

tasks.shadowJar {
	archiveFileName = "feed-processor.jar"
	mergeServiceFiles()
	manifest {
		attributes["Main-Class"] = "openmedia.feeds.FeedProcessorJob"
	}
}
