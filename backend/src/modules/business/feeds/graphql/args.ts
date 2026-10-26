import { InputType } from "@nestjs/graphql"
import { PaginatedInput } from "@openmedia/backend/utils/pagination"

@InputType()
export class GetFeedArgs extends PaginatedInput {}
