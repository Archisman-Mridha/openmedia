import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: "followships" })
export class FollowshipEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Index()
	@Column({ name: "follower_id", type: "integer" })
	followerID: number

	@Index()
	@Column({ name: "followee_id", type: "integer" })
	followeeID: number
}
