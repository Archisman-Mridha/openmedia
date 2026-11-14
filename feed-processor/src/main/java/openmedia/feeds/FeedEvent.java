package openmedia.feeds;

/**
 * A change captured by Debezium, normalised into the only shape the feed fan-out needs.
 *
 * <p>For followship events {@code authorID} is the followee and {@code followerID} the follower.
 * For post events {@code authorID} is the post author and {@code postID} the post.
 * {@code timestamp} is the commit time of the source transaction (Debezium's {@code source.ts_ms}),
 * which is what the event time of the pipeline is based on.
 */
public record FeedEvent(Type type, int authorID, int followerID, int postID, long timestamp) {

	public enum Type {
		FOLLOWSHIP_CREATED,
		FOLLOWSHIP_DELETED,
		POST_CREATED
	}

	public static FeedEvent followshipCreated(int followeeID, int followerID, long timestamp) {
		return new FeedEvent(Type.FOLLOWSHIP_CREATED, followeeID, followerID, 0, timestamp);
	}

	public static FeedEvent followshipDeleted(int followeeID, int followerID, long timestamp) {
		return new FeedEvent(Type.FOLLOWSHIP_DELETED, followeeID, followerID, 0, timestamp);
	}

	public static FeedEvent postCreated(int authorID, int postID, long timestamp) {
		return new FeedEvent(Type.POST_CREATED, authorID, 0, postID, timestamp);
	}
}
