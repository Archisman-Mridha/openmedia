import { Field, InputType, Int } from "@nestjs/graphql"
import { PaginatedInput } from "@openmedia/backend/utils/pagination"

@InputType()
export class CreateFollowshipArgs {
	@Field(() => Int)
	followeeID: number
}

@InputType()
export class DeleteFollowshipArgs {
	@Field(() => Int)
	followeeID: number
}

@InputType()
export class GetFolloweesArgs extends PaginatedInput {
	@Field(() => Int)
	followerID: number
}

@InputType()
export class GetFollowersArgs extends PaginatedInput {
	@Field(() => Int)
	followeeID: number
}

@InputType()
export class FollowshipExistsArgs {
	@Field(() => Int)
	followerID: number

	@Field(() => Int)
	followeeID: number
}
