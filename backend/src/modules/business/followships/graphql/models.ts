import { Field, Int, ObjectType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { ProfilePreview } from "../../profiles/graphql/models"

@ObjectType()
export class Follower {
	@Field(() => Int)
	id: number

	// NOTE : Resolved by the GraphQL server.
	@Field(() => ProfilePreview)
	profilePreview?: ProfilePreview & {}
}

@ObjectType()
export class Followers extends PaginatedOutput {
	@Field(() => [Follower])
	followers: Array<Follower>
}

@ObjectType()
export class Followee {
	@Field(() => Int)
	id: number

	// NOTE : Resolved by the GraphQL server.
	@Field(() => ProfilePreview)
	profilePreview?: ProfilePreview & {}
}

@ObjectType()
export class Followees extends PaginatedOutput {
	@Field(() => [Followee])
	followees: Array<Followee>
}

@ObjectType()
export class FollowshipCounts {
	@Field(() => Int)
	followerCount: number

	@Field(() => Int)
	followeeCount: number
}
