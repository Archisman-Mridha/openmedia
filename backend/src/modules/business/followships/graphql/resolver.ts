import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { ProfilePreview } from "../../profiles/graphql/models"
import { GetProfilePreviewByIDQuery } from "../../profiles/queries/get-profile-preview-by-id"
import { CreateFollowshipCommand } from "../commands/create-followship"
import { DeleteFollowshipCommand } from "../commands/delete-followship"
import { GetFolloweesQuery } from "../queries/get-followees"
import { GetFollowersQuery } from "../queries/get-followers"
import {
	CreateFollowshipArgs,
	DeleteFollowshipArgs,
	GetFolloweesArgs,
	GetFollowersArgs
} from "./args"
import { Followee, FolloweesConnection, Follower, FollowersConnection } from "./models"

@Resolver(Follower)
export class FollowerResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@ResolveField(() => ProfilePreview)
	async resolveProfilePreview(@Parent() follower: Follower): Promise<ProfilePreview> {
		return this.queryBus.execute(new GetProfilePreviewByIDQuery({ id: follower.id }))
	}
}

@Resolver(Followee)
export class FolloweeResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@ResolveField(() => ProfilePreview)
	async resolveProfilePreview(@Parent() followee: Followee): Promise<ProfilePreview> {
		return this.queryBus.execute(new GetProfilePreviewByIDQuery({ id: followee.id }))
	}
}

@Resolver()
export class FollowshipsResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@Mutation(() => Boolean)
	async follow(
		@CurrentUser() followerID: number,
		@Args() args: CreateFollowshipArgs
	): Promise<boolean> {
		await this.commandBus.execute(new CreateFollowshipCommand({ followerID, ...args }))

		return true
	}

	@Mutation(() => Boolean)
	async unfollow(
		@CurrentUser() followerID: number,
		@Args() args: DeleteFollowshipArgs
	): Promise<boolean> {
		await this.commandBus.execute(new DeleteFollowshipCommand({ followerID, ...args }))

		return true
	}

	@Query(() => FollowersConnection)
	async getFollowers(@Args() args: GetFollowersArgs): Promise<FollowersConnection> {
		const { edges, pageInfo } = await this.queryBus.execute(new GetFollowersQuery(args))

		return {
			edges: edges.map(({ cursor, node: followerID }) => ({ cursor, node: { id: followerID } })),
			pageInfo
		}
	}

	@Query(() => FolloweesConnection)
	async getFollowees(@Args() args: GetFolloweesArgs): Promise<FolloweesConnection> {
		const { edges, pageInfo } = await this.queryBus.execute(new GetFolloweesQuery(args))

		return {
			edges: edges.map(({ cursor, node: followeeID }) => ({ cursor, node: { id: followeeID } })),
			pageInfo
		}
	}
}
