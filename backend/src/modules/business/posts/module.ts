import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { CreatePostHandler } from "./commands/create-post"
import { PostEntity } from "./entity"
import { PostsResolver } from "./graphql/resolvers"
import { GetPostByIDHandler } from "./queries/get-post-by-id"
import { GetPostsByAuthorHandler } from "./queries/get-posts-by-author"
import { GetPostsByIDsHandler } from "./queries/get-posts-by-ids"

@Module({
	imports: [MikroOrmModule.forFeature([PostEntity])],
	providers: [
		PostsResolver,

		// Commands.
		CreatePostHandler,

		// Queries.
		GetPostsByAuthorHandler,
		GetPostByIDHandler,
		GetPostsByIDsHandler
	]
})
export class PostsModule {}
