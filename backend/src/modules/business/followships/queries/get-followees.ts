import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { PaginatedInput, PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { FollowshipEntity } from "../entity"

export interface GetFolloweesInput extends PaginatedInput {
	followerID: number
}

export interface GetFolloweesOutput extends PaginatedOutput {
	followeeIDs: Array<number>
}

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
		const [followships, count] = await this.followshipsRepository.findAndCount(
			{ followerID: input.followerID },
			{
				orderBy: { id: "desc" },

				offset: input.offset,
				limit: input.limit
			}
		)

		const followeeIDs = followships.map((followship) => followship.followeeID)

		return { count, followeeIDs }
	}
}
