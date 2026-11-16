import { PrimaryKeyProp } from "@mikro-orm/core"
import { Entity, Index, PrimaryKey } from "@mikro-orm/decorators/legacy"

@Entity({ tableName: "followships" })
export class FollowshipEntity {
	[PrimaryKeyProp]?: ["follower_id", "followee_id"]

	@Index({ name: "followers_index" })
	@PrimaryKey({ type: "integer" })
	follower_id: number

	@Index({ name: "followees_index" })
	@PrimaryKey({ type: "integer" })
	followee_id: number
}
