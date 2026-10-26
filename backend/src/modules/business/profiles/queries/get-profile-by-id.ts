import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { NotFoundException } from "@nestjs/common"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { ProfileEntity } from "../entity"

export interface GetProfileByIDInput {
	id: number
}

export class GetProfileByIDQuery extends Query<ProfileEntity> {
	constructor(readonly input: GetProfileByIDInput) {
		super()
	}
}

@QueryHandler(GetProfileByIDQuery)
export class GetProfileByIDHandler implements IQueryHandler<GetProfileByIDQuery> {
	constructor(
		@InjectRepository(ProfileEntity)
		private readonly profilesRepository: EntityRepository<ProfileEntity>
	) {}

	async execute({ input }: GetProfileByIDQuery): Promise<ProfileEntity> {
		const profile = await this.profilesRepository.findOne({ id: input.id })
		if (!profile) throw new NotFoundException()

		return profile
	}
}
