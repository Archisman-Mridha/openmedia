import { EntityRepository, type FilterQuery } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { UserEntity } from "../entity"

export class GetUserQuery extends Query<UserEntity | null> {
	constructor(public readonly query: FilterQuery<UserEntity>) {
		super()
	}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: EntityRepository<UserEntity>
	) {}

	execute(query: GetUserQuery): Promise<UserEntity | null> {
		return this.usersRepository.findOne(query.query)
	}
}
