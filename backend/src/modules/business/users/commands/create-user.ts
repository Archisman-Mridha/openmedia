import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
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
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async execute({ input }: CreateUserCommand): Promise<UserEntity> {
		const user = this.usersRepository.create(input)

		// TODO : Detect duplicate email and username.
		return await this.usersRepository.save(user)
	}
}
