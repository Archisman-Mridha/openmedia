import { Field, ObjectType, PickType } from "@nestjs/graphql"
import { createConnection } from "@openmedia/backend/utils/pagination"
import { FollowshipCounts } from "../../followships/graphql/models"
import { Post } from "../../posts/graphql/models"
import { ProfileEntity } from "../entity"

@ObjectType()
export class Profile extends ProfileEntity {
	@Field()
	isFollowee: boolean

	// NOTE : Following fields are resolved by GraphQL.

	@Field(() => FollowshipCounts)
	followshipCounts?: FollowshipCounts & {}

	@Field(() => [Post])
	posts?: Array<Post>
}

@ObjectType()
export class ProfilePreview extends PickType(Profile, ["id", "name", "username"]) {}

@ObjectType()
export class ProfilePreviewsConnection extends createConnection(ProfilePreview) {}
