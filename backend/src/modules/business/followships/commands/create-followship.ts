import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { FollowshipEntity } from "../entity"

export interface CreateFollowshipInput {
	followerID: number
	followeeID: number
}

export class CreateFollowshipCommand extends Command<void> {
	constructor(readonly input: CreateFollowshipInput) {
		super()
	}
}

@CommandHandler(CreateFollowshipCommand)
export class CreateFollowshipHandler implements ICommandHandler<CreateFollowshipCommand> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: CreateFollowshipCommand): Promise<void> {
		this.followshipsRepository.create(input)
		await this.followshipsRepository.getEntityManager().flush()
	}
}
