import { Field, ObjectType, PickType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { FollowshipCounts } from "../../followships/graphql/models"
import { Post } from "../../posts/graphql/models"
import { ProfileEntity } from "../entity"

@ObjectType()
export class Profile extends ProfileEntity {
	@Field()
	isFollowee: boolean

	// NOTE : Resolved by the GraphQL server.
	@Field(() => FollowshipCounts)
	followshipCounts?: FollowshipCounts & {}

	// NOTE : Resolved by the GraphQL server.
	@Field(() => [Post])
	posts?: Array<Post>
}

@ObjectType()
export class ProfilePreview extends PickType(Profile, ["id", "name", "username"]) {}

@ObjectType()
export class ProfilePreviews extends PaginatedOutput {
	@Field(() => [ProfilePreview])
	profilePreviews: Array<ProfilePreview>
}
