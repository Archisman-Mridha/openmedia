import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CreateProfileHandler } from "./commands/create-profile"
import { IndexProfileHandler } from "./commands/index-profile"
import { ProfileEntity } from "./entity"
import { ProfilesResolver } from "./graphql/resolvers"
import { GetProfileByIDHandler } from "./queries/get-profile-by-id"
import { GetProfilePreviewByIDHandler } from "./queries/get-profile-preview-by-id"
import { SearchProfilesHandler } from "./queries/search-profiles"

@Module({
	imports: [TypeOrmModule.forFeature([ProfileEntity])],
	providers: [
		ProfilesResolver,

		// Commads.
		CreateProfileHandler,
		IndexProfileHandler,

		// Queries.
		SearchProfilesHandler,
		GetProfilePreviewByIDHandler,
		GetProfileByIDHandler
	]
})
export class ProfilesModule {}
