import { ArgsType } from "@nestjs/graphql"
import { PaginatedInput } from "@openmedia/backend/utils/pagination"

@ArgsType()
export class GetFeedArgs extends PaginatedInput {}
