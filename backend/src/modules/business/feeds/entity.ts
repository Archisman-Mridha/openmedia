import { Entity, Index, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy"

@Entity({ tableName: "feeds" })
@Unique({ properties: ["consumerID", "postID"] })
@Index({ properties: ["consumerID", "postCreatedAt"] })
export class FeedEntity {
	@PrimaryKey()
	id!: number

	@Property({ fieldName: "consumer_id", type: "integer" })
	consumerID: number

	@Property({ fieldName: "post_id", type: "integer" })
	postID: number

	@Property({ fieldName: "post_author_id", type: "integer" })
	postAuthorID: number

	@Property({ fieldName: "post_created_at", type: "Date", columnType: "timestamptz" })
	postCreatedAt: Date
}
