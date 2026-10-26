import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { IConnection, PaginatedInput } from "@openmedia/backend/utils/pagination"
import { FollowshipEntity } from "../entity"

export interface GetFollowersInput extends PaginatedInput {
	followeeID: number
}

export interface GetFollowersOutput extends IConnection<number> {}

export class GetFollowersQuery extends Query<GetFollowersOutput> {
	constructor(readonly input: GetFollowersInput) {
		super()
	}
}

@QueryHandler(GetFollowersQuery)
export class GetFollowersHandler implements IQueryHandler<GetFollowersQuery> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: GetFollowersQuery): Promise<GetFollowersOutput> {
		const cursor = await this.followshipsRepository.findByCursor({
			where: { followeeID: input.followeeID },
			orderBy: { id: "desc" },

			first: input.first,
			after: input.after,

			includeCount: false
		})

		return {
			edges: cursor.items.map((followship) => ({
				cursor: cursor.from(followship),
				node: followship.followerID
			})),
			pageInfo: {
				startCursor: cursor.startCursor,
				endCursor: cursor.endCursor,
				hasNextPage: cursor.hasNextPage
			}
		}
	}
}
