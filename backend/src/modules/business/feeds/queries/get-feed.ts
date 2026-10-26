import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { IConnection, type PaginatedInput } from "@openmedia/backend/utils/pagination"
import { FeedEntity } from "../entity"

export interface GetFeedInput extends PaginatedInput {
	userID: number
}

export interface GetFeedOutput extends IConnection<number> {}

export class GetFeedQuery extends Query<GetFeedOutput> {
	constructor(readonly input: GetFeedInput) {
		super()
	}
}

@QueryHandler(GetFeedQuery)
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
	constructor(
		@InjectRepository(FeedEntity)
		private readonly feedRepository: EntityRepository<FeedEntity>
	) {}

	async execute({ input }: GetFeedQuery): Promise<GetFeedOutput> {
		const cursor = await this.feedRepository.findByCursor({
			where: { consumerID: input.userID },
			orderBy: { postCreatedAt: "desc", id: "desc" },
			fields: ["postID", "postCreatedAt"],

			first: input.first,
			after: input.after,

			includeCount: false
		})

		return {
			edges: cursor.items.map((row) => ({ cursor: cursor.from(row), node: row.postID })),
			pageInfo: {
				startCursor: cursor.startCursor,
				endCursor: cursor.endCursor,
				hasNextPage: cursor.hasNextPage
			}
		}
	}
}
