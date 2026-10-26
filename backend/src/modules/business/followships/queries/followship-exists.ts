import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { FollowshipEntity } from "../entity"

export interface FollowshipExistsInput {
	followerID: number
	followeeID: number
}

export class FollowshipExistsQuery extends Query<boolean> {
	constructor(readonly input: FollowshipExistsInput) {
		super()
	}
}

@QueryHandler(FollowshipExistsQuery)
export class FollowshipExistsHandler implements IQueryHandler<FollowshipExistsQuery> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: FollowshipExistsQuery): Promise<boolean> {
		const count = await this.followshipsRepository.count({
			followerID: input.followerID,
			followeeID: input.followeeID
		})
		return count > 0
	}
}
