import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { type PaginatedInput } from "@openmedia/backend/utils/pagination"
import { FeedEntity } from "../entity"

export interface GetFeedInput extends PaginatedInput {
	userID: number
}

export interface GetFeedOutput {
	postIDs: Array<number>
}

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
		const rows = await this.feedRepository.find(
			{ consumerID: input.userID },
			{
				orderBy: { postCreatedAt: "desc" },
				fields: ["postID"],

				offset: input.offset,
				limit: input.limit
			}
		)

		return {
			postIDs: rows.map((row) => row.postID)
		}
	}
}
