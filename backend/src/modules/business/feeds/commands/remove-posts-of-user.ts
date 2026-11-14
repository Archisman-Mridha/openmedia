import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { FeedEntity } from "../entity"

export interface RemovePostsOfUserInput {
	consumerID: number
	postAuthorID: number
}

export class RemovePostsOfUserCommand extends Command<void> {
	constructor(readonly input: RemovePostsOfUserInput) {
		super()
	}
}

@CommandHandler(RemovePostsOfUserCommand)
export class RemovePostsOfUserHandler implements ICommandHandler<RemovePostsOfUserCommand> {
	constructor(
		@InjectRepository(FeedEntity)
		private readonly feedRepository: EntityRepository<FeedEntity>
	) {}

	async execute({ input }: RemovePostsOfUserCommand): Promise<void> {
		await this.feedRepository.nativeDelete({
			consumerID: input.consumerID,
			postAuthorID: input.postAuthorID
		})
	}
}
