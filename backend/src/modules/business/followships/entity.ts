import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: "followships" })
export class FollowshipEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Index("followships_follower_id_key")
	@Column({ name: "follower_id", type: "integer" })
	followerID: number

	@Index("followships_followee_id_key")
	@Column({ name: "followee_id", type: "integer" })
	followeeID: number
}
