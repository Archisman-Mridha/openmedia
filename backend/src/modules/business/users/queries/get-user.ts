import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOneOptions, Repository } from "typeorm"
import { UserEntity } from "../entity"

export class GetUserQuery extends Query<UserEntity | null> {
	constructor(public readonly query: FindOneOptions<UserEntity>) {
		super()
	}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	execute(query: GetUserQuery): Promise<UserEntity | null> {
		return this.usersRepository.findOne(query.query)
	}
}
