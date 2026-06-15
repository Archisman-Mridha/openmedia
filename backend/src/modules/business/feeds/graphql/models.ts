import { Field, ObjectType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { Post } from "../../posts/graphql/models"

@ObjectType()
export class Feed extends PaginatedOutput {
	@Field(() => [Number])
	postIDs: Array<number>

	// NOTE : Resolved by the GraphQL server.
	@Field(() => [Post])
	posts?: Array<Post>
}
