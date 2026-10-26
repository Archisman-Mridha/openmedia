import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { IConnection, PaginatedInput } from "@openmedia/backend/utils/pagination"
import { PostEntity } from "../entity"

export interface GetPostsByAuthorInput extends PaginatedInput {
	authorID: number
}

export interface GetPostsByAuthorOutput extends IConnection<PostEntity> {}

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
		const cursor = await this.postsRepository.findByCursor({
			where: { authorID: input.authorID },
			orderBy: { id: "desc" },

			first: input.first,
			after: input.after,

			includeCount: false
		})

		return {
			edges: cursor.items.map((post) => ({ cursor: cursor.from(post), node: post })),
			pageInfo: {
				startCursor: cursor.startCursor,
				endCursor: cursor.endCursor,
				hasNextPage: cursor.hasNextPage
			}
		}
	}
}
