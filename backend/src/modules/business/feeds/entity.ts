import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm"

@Entity({ name: "feeds" })
@Unique(["consumerID", "postID"])
@Index(["consumerID", "postCreatedAt"])
export class FeedEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string

	@Column({ name: "consumer_id", type: "integer" })
	consumerID: number

	@Column({ name: "post_id", type: "integer" })
	postID: number

	@Index()
	@Column({ name: "post_author_id", type: "integer" })
	postAuthorID: number

	@Column({ name: "post_created_at", type: "timestamp with time zone" })
	postCreatedAt: Date
}
