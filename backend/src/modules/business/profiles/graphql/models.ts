import { Field, ObjectType, PickType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { ProfileEntity } from "../entity"

@ObjectType()
export class Profile extends ProfileEntity {
	@Field()
	isFollowee: boolean
}

@ObjectType()
export class ProfilePreview extends PickType(Profile, ["id", "name", "username"]) {}

@ObjectType()
export class ProfilePreviews extends PaginatedOutput {
	@Field(() => [ProfilePreview])
	profilePreviews: Array<ProfilePreview>
}
