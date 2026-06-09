import { Field, ObjectType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { PostEntity } from "../entity"

@ObjectType()
export class Post extends PostEntity {}

@ObjectType()
export class Posts extends PaginatedOutput {
	@Field(() => [Post])
	posts: Array<Post>
}
