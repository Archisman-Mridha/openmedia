import { Controller } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { EventPattern, Payload } from "@nestjs/microservices"
import { ProfileCreatedEvent, UserCreatedEvent } from "@openmedia/backend/utils/events"
import { KafkaTopic } from "@openmedia/backend/utils/kafka"
import { CreateProfileCommand } from "../commands/create-profile"
import { IndexProfileCommand } from "../commands/index-profile"

@Controller()
export class EventsController {
	constructor(private readonly commandBus: CommandBus) {}

	@EventPattern(KafkaTopic.EVENTS_USERS_CREATED)
	async onUserCreated(@Payload() event: UserCreatedEvent): Promise<void> {
		await this.commandBus.execute(new CreateProfileCommand(event.after))
	}

	@EventPattern(KafkaTopic.EVENTS_PROFILES_CREATED)
	async onProfileCreated(@Payload() event: ProfileCreatedEvent): Promise<void> {
		await this.commandBus.execute(new IndexProfileCommand(event.after))
	}
}
