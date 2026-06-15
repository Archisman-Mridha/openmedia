import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FeedEntity } from "./entity"
import { FeedsResolver } from "./graphql/resolvers"
import { GetFeedHandler } from "./queries/get-feed"

@Module({
	imports: [TypeOrmModule.forFeature([FeedEntity])],
	providers: [
		FeedsResolver,

		// Queries.
		GetFeedHandler
	]
})
export class FeedsModule {}
