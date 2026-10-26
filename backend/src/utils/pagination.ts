import { Type } from "@nestjs/common"
import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IsPositive, Max } from "class-validator"

export const DEFAULT_FIRST = 25,
	MAX_FIRST = 100

/*
  Since numeric offsets within paginated lists can be unreliable, a common improvement is to
  identify the beginning of a page using some unique identifier that belongs to each element of the
  list.

  If the list represents a set of elements without duplicates, this identifier could simply be the
  unique ID of each object, allowing additional pages to be requested using the ID of the last
  object in the list, together with some limit argument. With this approach, the requested cursor
  ID should not appear in the new page, since it identifies the item just before the beginning of
  the page.

  Using Relay-style connections is similar to cursor-based pagination, but differs in the format of
  the query response, which affects the way cursors are managed. In addition to connection.edges,
  which is a list of { cursor, node } objects, where each edge.node is a list item, Relay provides
  a connection.pageInfo object which gives the cursors of the first and last items in
  connection.edges as connection.pageInfo.startCursor and connection.pageInfo.endCursor,
  respectively. The pageInfo object also contains the boolean properties hasPreviousPage and
  hasNextPage, which can be used to determine if there are more results available (both forwards
  and backwards)

  An example GraphQL query which uses relay style pagination :

    query Comments($cursor: String) {
      comments(first: 10, after: $cursor) {
        edges {
          node {
            author
            text
          }
        }

        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }

  You can read GraphQL Relay's spec regarding cursor based pagination for GraphQL APIs here :
  https://relay.dev/graphql/connections.htm
*/

@ArgsType()
@InputType({ isAbstract: true })
export abstract class PaginatedInput {
	@IsPositive()
	@Max(MAX_FIRST)
	@Field(() => Int, { defaultValue: DEFAULT_FIRST })
	first: number = DEFAULT_FIRST

	@Field({ nullable: true })
	after?: string
}

interface IEdge<N> {
	cursor: string
	node: N
}

export interface IConnection<N> {
	edges: Array<IEdge<N>>
	pageInfo: PageInfo
}

@ObjectType()
class PageInfo {
	@Field(() => String, { nullable: true })
	startCursor?: string

	@Field(() => String, { nullable: true })
	endCursor?: string

	@Field()
	hasNextPage: boolean
}

export function createConnection<N>(nodeType: Type<N>): Type<IConnection<N>> {
	@ObjectType(`${nodeType.name}Edge`)
	class Edge implements IEdge<N> {
		@Field()
		cursor: string

		@Field(() => nodeType)
		node: N
	}

	@ObjectType({ isAbstract: true })
	abstract class Connection implements IConnection<N> {
		@Field(() => [Edge])
		edges: Array<Edge>

		@Field()
		pageInfo: PageInfo
	}
	return Connection as Type<IConnection<N>>
}
