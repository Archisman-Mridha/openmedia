import { Field, ObjectType } from "@nestjs/graphql"
import { createConnection } from "@openmedia/backend/utils/pagination"
import { ProfilePreview } from "../../profiles/graphql/models"
import { PostEntity } from "../entity"

@ObjectType()
export class Post extends PostEntity {
	// NOTE : Resolved by the GraphQL server.
	@Field(() => ProfilePreview)
	authorProfilePreview?: ProfilePreview
}

export class PostsConnection extends createConnection(Post) {}
