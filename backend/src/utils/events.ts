import type { ProfileEntity } from "@openmedia/backend/modules/business/profiles/entity"
import type { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import { FollowshipEntity } from "../modules/business/followships/entity"

export namespace CDC {
	export enum Operation {
		Create = "c",
		Update = "u",
		Delete = "d"
	}

	export type Event<Row> = CreatedEvent<Row> | UpdatedEvent<Row> | DeletedEvent<Row>

	export class CreatedEvent<Row> {
		payload: {
			op: Operation.Create
			after: Row
		}
	}

	export class UpdatedEvent<Row> {
		payload: {
			op: Operation.Update
			before: Row
			after: Row
		}
	}

	export class DeletedEvent<Row> {
		payload: {
			op: Operation.Delete
			before: Row
		}
	}
}

export class UserCreatedEvent extends CDC.CreatedEvent<UserEntity> {}

export class ProfileCreatedEvent extends CDC.CreatedEvent<ProfileEntity> {}

export type FollowshipEvent = CDC.Event<FollowshipEntity>
