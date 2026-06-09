import { Injectable } from "@nestjs/common"
import type { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Query, Resolver } from "@nestjs/graphql"
import { EventPattern, Payload } from "@nestjs/microservices"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import type { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import type { ProfileCreatedEvent, UserCreatedEvent } from "@openmedia/backend/utils/events"
import { KafkaTopic } from "@openmedia/backend/utils/kafka"
import { CreateProfileCommand } from "../commands/create-profile"
import { IndexProfileCommand } from "../commands/index-profile"
import { GetProfileByIDQuery } from "../queries/get-profile-by-id"
import { SearchProfilesQuery } from "../queries/search-profiles"
import type { GetProfileByIDArgs, SearchProfilesArgs } from "./args"
import { Profile, ProfilePreviews } from "./models"

@Injectable()
@Resolver(() => Profile)
export class ProfilesResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@EventPattern(KafkaTopic.EVENTS_USERS_CREATED)
	async onUserCreated(@Payload() event: UserCreatedEvent): Promise<void> {
		await this.commandBus.execute(new CreateProfileCommand(event.payload.after))
	}

	@EventPattern(KafkaTopic.EVENTS_PROFILES_CREATED)
	async onProfileCreated(@Payload() event: ProfileCreatedEvent): Promise<void> {
		await this.commandBus.execute(new IndexProfileCommand(event.payload.after))
	}

	@Query(() => ProfilePreviews)
	async searchProfiles(@Args() args: SearchProfilesArgs): Promise<ProfilePreviews> {
		return this.queryBus.execute(new SearchProfilesQuery(args))
	}

	@Query(() => Profile)
	async getProfileByID(
		@CurrentUser() _user: UserEntity,
		@Args() args: GetProfileByIDArgs
	): Promise<Profile> {
		const profileEntity = await this.queryBus.execute(new GetProfileByIDQuery(args))

		/*
      TODO : We need to invoke the followships microservice, to get this data.

      // Find out whethe the current user follows this profile.
      // Or in other words, whether this profile is a followee of the user.
      const isFollowee = await this.queryBus.execute(
        new FollowshipExistsQuery({
          followerID: user.id,
          followeeID: profileEntity.id
        })
      )
    */
		const isFollowee = false

		const profile = {
			...profileEntity,
			isFollowee
		}
		return profile
	}
}
