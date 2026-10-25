import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Repository } from "typeorm"
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
		private readonly postsRepository: Repository<PostEntity>
	) {}

	async execute({ input }: GetPostsByIDsQuery): Promise<Array<PostEntity>> {
		const posts = await this.postsRepository.findBy({ id: In(input.ids) })

		const postsByID = new Map(posts.map((post) => [post.id, post]))
		return input.ids.flatMap((id) => postsByID.get(id) ?? [])
	}
}
