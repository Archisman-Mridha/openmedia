import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
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
import { Followees, Followers } from "./models"

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

	@Query(() => Followers)
	async getFollowers(@Args() args: GetFollowersArgs): Promise<Followers> {
		const { count, followerIDs } = await this.queryBus.execute(new GetFollowersQuery(args))

		const followers = followerIDs.map((followerID) => ({ id: followerID }))

		return {
			count,
			followers
		}
	}

	@Query(() => Followees)
	async getFollowees(@Args() args: GetFolloweesArgs): Promise<Followees> {
		const { count, followeeIDs } = await this.queryBus.execute(new GetFolloweesQuery(args))

		const followees = followeeIDs.map((followeeID) => ({ id: followeeID }))

		return {
			count,
			followees
		}
	}
}
