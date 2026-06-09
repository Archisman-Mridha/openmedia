import { Field, InputType, Int } from "@nestjs/graphql"
import { PaginatedInput } from "@openmedia/backend/utils/pagination"

@InputType()
export class SearchProfilesArgs extends PaginatedInput {
	@Field()
	query: string
}

@InputType()
export class GetProfileByIDArgs {
	@Field(() => Int)
	id: number
}
