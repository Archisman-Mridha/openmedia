import { EntityRepository } from "@mikro-orm/core"
import { InjectRepository } from "@mikro-orm/nestjs"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { PostEntity } from "../entity"

export interface GetPostsByIDsInput {
	ids: Array<number>
}

export class GetPostsByIDsQuery extends Query<Array<PostEntity>> {
	constructor(readonly input: GetPostsByIDsInput) {
		super()
	}
}

@QueryHandler(GetPostsByIDsQuery)
export class GetPostsByIDsHandler implements IQueryHandler<GetPostsByIDsQuery> {
	constructor(
		@InjectRepository(PostEntity)
		private readonly postsRepository: EntityRepository<PostEntity>
	) {}

	async execute({ input }: GetPostsByIDsQuery): Promise<Array<PostEntity>> {
		const posts = await this.postsRepository.find({ id: { $in: input.ids } })

		const postsByID = new Map(posts.map((post) => [post.id, post]))
		return input.ids.flatMap((id) => postsByID.get(id) ?? [])
	}
}
