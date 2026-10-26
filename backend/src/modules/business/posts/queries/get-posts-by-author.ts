import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { PaginatedInput, PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { PostEntity } from "../entity"

export interface GetPostsByAuthorInput extends PaginatedInput {
	authorID: number
}

export interface GetPostsByAuthorOutput extends PaginatedOutput {
	posts: Array<PostEntity>
}

export class GetPostsByAuthorQuery extends Query<GetPostsByAuthorOutput> {
	constructor(readonly input: GetPostsByAuthorInput) {
		super()
	}
}

@QueryHandler(GetPostsByAuthorQuery)
export class GetPostsByAuthorHandler implements IQueryHandler<GetPostsByAuthorQuery> {
	constructor(
		@InjectRepository(PostEntity)
		private readonly postsRepository: EntityRepository<PostEntity>
	) {}

	async execute({ input }: GetPostsByAuthorQuery): Promise<GetPostsByAuthorOutput> {
		const [posts, count] = await this.postsRepository.findAndCount(
			{ authorID: input.authorID },
			{
				offset: input.offset,
				limit: input.limit
			}
		)

		return { posts, count }
	}
}
