import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { UserEntity } from "../entity"

export interface CreateUserInput {
	name: string
	email: string
	username: string
	password: string
}

export class CreateUserCommand extends Command<UserEntity> {
	constructor(readonly input: CreateUserInput) {
		super()
	}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: EntityRepository<UserEntity>
	) {}

	async execute({ input }: CreateUserCommand): Promise<UserEntity> {
		const user = this.usersRepository.create(input)

		// TODO : Detect duplicate email and username.
		await this.usersRepository.getEntityManager().flush()

		return user
	}
}
