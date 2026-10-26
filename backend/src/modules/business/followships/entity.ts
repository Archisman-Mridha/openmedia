import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/decorators/legacy"

@Entity({ tableName: "followships" })
export class FollowshipEntity {
	@PrimaryKey()
	id!: number

	@Index({ name: "followers_index" })
	@Property({ fieldName: "follower_id", type: "integer" })
	followerID: number

	@Index({ name: "followees_index" })
	@Property({ fieldName: "followee_id", type: "integer" })
	followeeID: number
}
