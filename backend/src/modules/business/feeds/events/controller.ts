import { Controller } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { EventPattern, Payload } from "@nestjs/microservices"
import { CDC, type FollowshipEvent } from "@openmedia/backend/utils/events"
import { KafkaTopic } from "@openmedia/backend/utils/kafka"
import { RemovePostsOfUserCommand } from "../commands/remove-posts-of-user"

@Controller()
export class EventsController {
	constructor(private readonly commandBus: CommandBus) {}

	@EventPattern(KafkaTopic.EVENTS_FOLLOWSHIPS)
	async onFollowshipEvent(@Payload() event: FollowshipEvent): Promise<void> {
		switch (event.payload.op) {
			case CDC.Operation.Delete: {
				const { follower_id, followee_id } = event.payload.before

				await this.commandBus.execute(
					new RemovePostsOfUserCommand({ consumerID: follower_id, postAuthorID: followee_id })
				)
				break
			}
		}
	}
}
