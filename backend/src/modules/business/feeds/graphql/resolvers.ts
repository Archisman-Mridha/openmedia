import { Injectable } from "@nestjs/common"
import { QueryBus } from "@nestjs/cqrs"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import { PostsConnection } from "../../posts/graphql/models"
import { GetPostsByIDsQuery } from "../../posts/queries/get-posts-by-ids"
import { GetFeedQuery } from "../queries/get-feed"
import { GetFeedArgs } from "./args"

@Injectable()
@Resolver()
export class FeedsResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => PostsConnection)
	async getFeed(
		@CurrentUser() user: UserEntity,
		@Args() args: GetFeedArgs
	): Promise<PostsConnection> {
		const feedsConnection = await this.queryBus.execute(
			new GetFeedQuery({ userID: user.id, ...args })
		)

		const posts = await this.queryBus.execute(
			new GetPostsByIDsQuery({ ids: feedsConnection.edges.map(({ node }) => node) })
		)
		const postsMap = new Map(posts.map((post) => [post.id, post]))

		return {
			edges: feedsConnection.edges.flatMap(({ cursor, node: postID }) => {
				const post = postsMap.get(postID)

				// NOTE : We get the post IDs from the feeds table.
				//        Now, when we're fetching those posts via the posts module, a post gets deleted.
				//        We need to handle that situation.
				return post ? [{ cursor, node: post }] : []
			}),
			pageInfo: feedsConnection.pageInfo
		}
	}
}
