import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/decorators/legacy"
import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { POST_DESCRIPTION_MAX_LENGTH } from "@openmedia/packages/validators"

@ObjectType({ isAbstract: true })
@Entity({ tableName: "posts" })
export class PostEntity {
	@Field(() => ID)
	@PrimaryKey()
	id!: number

	@Field(() => Int)
	@Index({ name: "author_posts_index" })
	@Property({ fieldName: "author_id", type: "integer" })
	authorID: number

	@Field({ nullable: true })
	@Property({ type: "varchar", length: POST_DESCRIPTION_MAX_LENGTH })
	description: string
}
