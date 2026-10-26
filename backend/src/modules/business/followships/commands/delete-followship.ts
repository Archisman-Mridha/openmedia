import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { FollowshipEntity } from "../entity"

export interface DeleteFollowshipInput {
	followerID: number
	followeeID: number
}

export class DeleteFollowshipCommand extends Command<void> {
	constructor(readonly input: DeleteFollowshipInput) {
		super()
	}
}

@CommandHandler(DeleteFollowshipCommand)
export class DeleteFollowshipHandler implements ICommandHandler<DeleteFollowshipCommand> {
	constructor(
		@InjectRepository(FollowshipEntity)
		private readonly followshipsRepository: EntityRepository<FollowshipEntity>
	) {}

	async execute({ input }: DeleteFollowshipCommand): Promise<void> {
		await this.followshipsRepository.nativeDelete(input)
	}
}
