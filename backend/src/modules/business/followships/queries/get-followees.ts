import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { IConnection, PaginatedInput } from "@openmedia/backend/utils/pagination"
import { FollowshipEntity } from "../entity"

export interface GetFolloweesInput extends PaginatedInput {
	followerID: number
}

export interface GetFolloweesOutput extends IConnection<number> {}

export class GetFolloweesQuery extends Query<GetFolloweesOutput> {
	constructor(readonly input: GetFolloweesInput) {
		super()
	}
}

@QueryHandler(GetFolloweesQuery)
export class GetFolloweesHandler implements IQueryHandler<GetFolloweesQuery> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: GetFolloweesQuery): Promise<GetFolloweesOutput> {
		const cursor = await this.followshipsRepository.findByCursor({
			where: { follower_id: input.followerID },
			orderBy: { followee_id: "desc" },

			first: input.first,
			after: input.after,

			includeCount: false
		})

		return {
			edges: cursor.items.map((followship) => ({
				cursor: cursor.from(followship),
				node: followship.followee_id
			})),
			pageInfo: {
				startCursor: cursor.startCursor,
				endCursor: cursor.endCursor,
				hasNextPage: cursor.hasNextPage
			}
		}
	}
}
