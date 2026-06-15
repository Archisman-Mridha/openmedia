import { Inject } from "@nestjs/common"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { MEILISEARCH_CLIENT } from "@openmedia/backend/modules/meilisearch/module"
import { MeilisearchIndex } from "@openmedia/backend/utils/meilisearch"
import { PaginatedInput, PaginatedOutput } from "@openmedia/backend/utils/pagination"
import { Meilisearch } from "meilisearch"
import { ProfilePreview } from "../types"

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
	constructor(
		@Inject(MEILISEARCH_CLIENT)
		private readonly meilisearchClient: Meilisearch
	) {}

	async execute({ input }: SearchProfilesQuery): Promise<SearchProfilesOutput> {
		const { hits, estimatedTotalHits } = await this.meilisearchClient
			.index<ProfilePreview>(MeilisearchIndex.PROFILES)
			.search(input.query, {
				attributesToSearchOn: ["name", "username"],

				offset: input.skip,
				limit: input.take
			})

		const profilePreviews = hits.map((hit: ProfilePreview) => ({
			id: hit.id,
			name: hit.name,
			username: hit.username
		}))

		return {
			count: estimatedTotalHits,
			profilePreviews
		}
	}
}
