import { Injectable } from "@nestjs/common"
import { QueryBus } from "@nestjs/cqrs"
import { Query, Resolver } from "@nestjs/graphql"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import { GetFeedQuery } from "../queries/get-feed"
import { GetFeedArgs } from "./args"
import { Feed } from "./models"

@Injectable()
@Resolver()
export class FeedsResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => Feed)
	async getFeed(@CurrentUser() user: UserEntity, @Args() args: GetFeedArgs): Promise<Feed> {
		return this.queryBus.execute(new GetFeedQuery({ userID: user.id, ...args }))
	}
}
