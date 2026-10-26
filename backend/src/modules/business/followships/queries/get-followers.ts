import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { PaginatedInput, PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { FollowshipEntity } from "../entity"

export interface GetFollowersInput extends PaginatedInput {
	followeeID: number
}

export interface GetFollowersOutput extends PaginatedOutput {
	followerIDs: Array<number>
}

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
		const [followships, count] = await this.followshipsRepository.findAndCount(
			{ followeeID: input.followeeID },
			{
				orderBy: { id: "desc" },

				offset: input.offset,
				limit: input.limit
			}
		)

		const followerIDs = followships.map((followship) => followship.followerID)

		return { count, followerIDs }
	}
}
