import { Injectable } from "@nestjs/common"
import { QueryBus } from "@nestjs/cqrs"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import { Post } from "../../posts/graphql/models"
import { GetPostsByIDsQuery } from "../../posts/queries/get-posts-by-ids"
import { GetFeedQuery } from "../queries/get-feed"
import { GetFeedArgs } from "./args"

@Injectable()
@Resolver()
export class FeedsResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => [Post])
	async getFeed(@CurrentUser() user: UserEntity, @Args() args: GetFeedArgs): Promise<Array<Post>> {
		const { postIDs } = await this.queryBus.execute(new GetFeedQuery({ userID: user.id, ...args }))

		return this.queryBus.execute(new GetPostsByIDsQuery({ ids: postIDs }))
	}
}
