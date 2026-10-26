import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { NotFoundException } from "@nestjs/common"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { ProfileEntity } from "../entity"
import { ProfilePreview } from "../types"

export interface GetProfilePreviewByIDInput {
	id: number
}

export class GetProfilePreviewByIDQuery extends Query<ProfilePreview> {
	constructor(readonly input: GetProfilePreviewByIDInput) {
		super()
	}
}

@QueryHandler(GetProfilePreviewByIDQuery)
export class GetProfilePreviewByIDHandler implements IQueryHandler<GetProfilePreviewByIDQuery> {
	constructor(
		@InjectRepository(ProfileEntity)
		private readonly profilesRepository: EntityRepository<ProfileEntity>
	) {}

	async execute({ input }: GetProfilePreviewByIDQuery): Promise<ProfilePreview> {
		const profilePreview = await this.profilesRepository.findOne(
			{ id: input.id },
			{ fields: ["id", "name", "username"] }
		)
		if (!profilePreview) throw new NotFoundException()

		return profilePreview
	}
}
