import { Field, ObjectType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { ProfilePreview } from "../../profiles/graphql/models"
import { PostEntity } from "../entity"

@ObjectType()
export class Post extends PostEntity {
	// NOTE : Resolved by the GraphQL server.
	@Field(() => ProfilePreview)
	authorProfilePreview?: ProfilePreview
}

@ObjectType()
export class Posts extends PaginatedOutput {
	@Field(() => [Post])
	posts: Array<Post>
}
