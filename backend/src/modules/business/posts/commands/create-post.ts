import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { PostEntity } from "../entity"

export interface CreatePostInput {
	authorID: number
	description: string
}

export class CreatePostCommand extends Command<PostEntity> {
	constructor(readonly input: CreatePostInput) {
		super()
	}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
	constructor(
		@InjectRepository(PostEntity)
		private readonly postsRepository: EntityRepository<PostEntity>
	) {}

	async execute({ input }: CreatePostCommand): Promise<PostEntity> {
		const post = this.postsRepository.create(input)
		await this.postsRepository.getEntityManager().flush()

		return post
	}
}
