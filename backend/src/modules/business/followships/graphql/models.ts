import { Field, Int, ObjectType } from "@nestjs/graphql"
import { createConnection } from "@openmedia/backend/utils/pagination"
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
export class FollowersConnection extends createConnection(Follower) {}

@ObjectType()
export class Followee {
	@Field(() => Int)
	id: number

	// NOTE : Resolved by the GraphQL server.
	@Field(() => ProfilePreview)
	profilePreview?: ProfilePreview & {}
}

@ObjectType()
export class FolloweesConnection extends createConnection(Followee) {}

@ObjectType()
export class FollowshipCounts {
	@Field(() => Int)
	followerCount: number

	@Field(() => Int)
	followeeCount: number
}
