import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { POST_DESCRIPTION_MAX_LENGTH } from "@openmedia/backend/validators/validators"
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@ObjectType({ isAbstract: true })
@Entity({ name: "posts" })
export class PostEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => Int)
	@Index()
	@Column({ name: "author_id", type: "integer" })
	authorID: number

	@Field({ nullable: true })
	@Column({ type: "varchar", length: POST_DESCRIPTION_MAX_LENGTH })
	description: string
}
