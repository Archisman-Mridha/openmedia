import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { RemovePostsOfUserHandler } from "./commands/remove-posts-of-user"
import { FeedEntity } from "./entity"
import { EventsController } from "./events/controller"
import { FeedsResolver } from "./graphql/resolvers"
import { GetFeedHandler } from "./queries/get-feed"

@Module({
	imports: [MikroOrmModule.forFeature([FeedEntity])],
	providers: [
		FeedsResolver,

		// Commands.
		RemovePostsOfUserHandler,

		// Queries.
		GetFeedHandler
	],
	controllers: [EventsController]
})
export class FeedsModule {}
