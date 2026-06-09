import { Field, InputType, Int, PickType } from "@nestjs/graphql"
import { PaginatedInput } from "@openmedia/backend/utils/pagination"
import { Post } from "./models"

@InputType()
export class CreatePostArgs extends PickType(Post, ["imageURL", "description"], InputType) {}

@InputType()
export class GetPostsByAuthorArgs extends PaginatedInput {
	@Field(() => Int)
	authorID: number
}

@InputType()
export class GetPostArgs {
	@Field(() => Int)
	id: number
}
