import { EntityRepository } from "@mikro-orm/core"
import { CreateRequestContext } from "@mikro-orm/decorators/legacy"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { ProfileEntity } from "../entity"

export class CreateProfileCommand extends Command<void> {
	constructor(readonly input: ProfileEntity) {
		super()
	}
}

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
	constructor(
		@InjectRepository(ProfileEntity)
		private readonly profilesRepository: EntityRepository<ProfileEntity>
	) {}

	@CreateRequestContext<CreateProfileHandler>((handler) => handler.profilesRepository)
	async execute({ input }: CreateProfileCommand): Promise<void> {
		this.profilesRepository.create(input)
		await this.profilesRepository.getEntityManager().flush()
	}
}
