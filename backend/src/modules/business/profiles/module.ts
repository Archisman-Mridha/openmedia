import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { CreateProfileHandler } from "./commands/create-profile"
import { IndexProfileHandler } from "./commands/index-profile"
import { ProfileEntity } from "./entity"
import { EventsController } from "./events/controller"
import { ProfilesResolver } from "./graphql/resolvers"
import { GetProfileByIDHandler } from "./queries/get-profile-by-id"
import { GetProfilePreviewByIDHandler } from "./queries/get-profile-preview-by-id"
import { SearchProfilesHandler } from "./queries/search-profiles"

@Module({
	imports: [MikroOrmModule.forFeature([ProfileEntity])],
	providers: [
		ProfilesResolver,

		// Commads.
		CreateProfileHandler,
		IndexProfileHandler,

		// Queries.
		SearchProfilesHandler,
		GetProfilePreviewByIDHandler,
		GetProfileByIDHandler
	],
	controllers: [EventsController]
})
export class ProfilesModule {}
