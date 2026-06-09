import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import type { ElasticsearchService } from "@nestjs/elasticsearch"
import { ElasticsearchIndex } from "@openmedia/backend/utils/elasticsearch"
import type { PaginatedInput, PaginatedOutput } from "@openmedia/backend/utils/pagination"
import type { ProfileDocument, ProfilePreview } from "../types"

export interface SearchProfilesInput extends PaginatedInput {
	query: string
}

export interface SearchProfilesOutput extends PaginatedOutput {
	profilePreviews: Array<ProfilePreview>
}

export class SearchProfilesQuery extends Query<SearchProfilesOutput> {
	constructor(readonly input: SearchProfilesInput) {
		super()
	}
}

@QueryHandler(SearchProfilesQuery)
export class SearchProfilesHandler implements IQueryHandler<SearchProfilesQuery> {
	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	async execute({ input }: SearchProfilesQuery): Promise<SearchProfilesOutput> {
		const { hits } = await this.elasticsearchService.search<ProfileDocument>({
			index: ElasticsearchIndex.PROFILES,
			from: input.skip,
			size: input.take,
			query: {
				multi_match: {
					query: input.query,
					fields: ["name", "username"]
				}
			}
		})

		const profilePreviews = hits.hits.map((hit) => ({
			id: Number(hit._id!),
			...hit._source!
		}))

		return {
			count: profilePreviews.length,
			profilePreviews
		}
	}
}
