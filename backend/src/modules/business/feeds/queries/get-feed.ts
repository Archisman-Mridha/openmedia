import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { InjectRepository } from "@nestjs/typeorm"
import { type PaginatedInput } from "@openmedia/backend/utils/pagination"
import { Repository } from "typeorm"
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
		private readonly feedRepository: Repository<FeedEntity>
	) {}

	async execute({ input }: GetFeedQuery): Promise<GetFeedOutput> {
		const rows = await this.feedRepository.find({
			where: { consumerID: input.userID },
			order: { postCreatedAt: "DESC" },
			select: { postID: true },

			skip: input.offset,
			take: input.limit
		})

		return {
			postIDs: rows.map((row) => row.postID)
		}
	}
}
