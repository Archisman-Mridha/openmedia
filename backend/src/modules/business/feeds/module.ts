import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { FeedEntity } from "./entity"
import { FeedsResolver } from "./graphql/resolvers"
import { GetFeedHandler } from "./queries/get-feed"

@Module({
	imports: [MikroOrmModule.forFeature([FeedEntity])],
	providers: [
		FeedsResolver,

		// Queries.
		GetFeedHandler
	]
})
export class FeedsModule {}
