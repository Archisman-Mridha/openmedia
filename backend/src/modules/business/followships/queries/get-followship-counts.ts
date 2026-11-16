import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { FollowshipEntity } from "../entity"

export interface GetFollowshipCountsInput {
	profileID: number
}

export interface GetFollowshipCountsOutput {
	followerCount: number
	followeeCount: number
}

export class GetFollowshipCountsQuery extends Query<GetFollowshipCountsOutput> {
	constructor(readonly input: GetFollowshipCountsInput) {
		super()
	}
}

@QueryHandler(GetFollowshipCountsQuery)
export class GetFollowshipCountsHandler implements IQueryHandler<GetFollowshipCountsQuery> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: GetFollowshipCountsQuery): Promise<GetFollowshipCountsOutput> {
		const [followerCount, followeeCount] = await Promise.all([
			this.followshipsRepository.count({ followee_id: input.profileID }),
			this.followshipsRepository.count({ follower_id: input.profileID })
		])

		return { followerCount, followeeCount }
	}
}
