import { Inject } from "@nestjs/common"
import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import { MEILISEARCH_CLIENT } from "@openmedia/backend/modules/meilisearch/module"
import { MeilisearchIndex } from "@openmedia/backend/utils/meilisearch"
import { IConnection, PaginatedInput } from "@openmedia/backend/utils/pagination"
import { getOffsetWithDefault, offsetToCursor } from "graphql-relay"
import { Meilisearch } from "meilisearch"
import { ProfilePreview } from "../types"

export interface SearchProfilesInput extends PaginatedInput {
	query: string
}

export interface SearchProfilesOutput extends IConnection<ProfilePreview> {}

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
		const offset = getOffsetWithDefault(input.after, -1) + 1

		const { hits } = await this.meilisearchClient
			.index<ProfilePreview>(MeilisearchIndex.PROFILES)
			.search(input.query, {
				attributesToSearchOn: ["name", "username"],

				offset,
				limit: input.first + 1
			})

		const edges = hits.slice(0, input.first).map((hit: ProfilePreview, index) => ({
			cursor: offsetToCursor(offset + index),
			node: {
				id: hit.id,
				name: hit.name,
				username: hit.username
			}
		}))

		return {
			edges,
			pageInfo: {
				startCursor: edges[0]?.cursor,
				endCursor: edges[edges.length - 1]?.cursor,
				hasNextPage: hits.length > input.first
			}
		}
	}
}
