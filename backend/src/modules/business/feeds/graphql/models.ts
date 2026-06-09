import { Field, ObjectType } from "@nestjs/graphql"
import { PaginatedOutput } from "@openmedia/backend/utils/pagination"

@ObjectType()
export class Feed extends PaginatedOutput {
	@Field(() => [Number])
	postIDs: Array<number>
}
