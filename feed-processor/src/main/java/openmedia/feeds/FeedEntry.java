package openmedia.feeds;

/** A row of the {@code feeds} table : post {@code postID} shows up in the feed of {@code consumerID}. */
public record FeedEntry(int consumerID, int postID, int postAuthorID, long postCreatedAt) {}
