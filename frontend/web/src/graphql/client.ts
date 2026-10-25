import { ApolloLink, HttpLink } from "@apollo/client"
import { PersistedQueryLink } from "@apollo/client/link/persisted-queries"
import { RemoveTypenameFromVariablesLink } from "@apollo/client/link/remove-typename"
import { RetryLink } from "@apollo/client/link/retry"
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs"
import { sha256 } from "crypto-hash"

export const createApolloClient = () =>
	new ApolloClient({
		/*
      Apollo Client stores the results of your GraphQL queries in a local, normalized, in-memory
      cache. This enables Apollo Client to respond almost immediately to queries for
      already-cached data, without even sending a network request.

      The Apollo Client cache is highly configurable. You can customize its behavior for
      individual types and fields in your schema, and you can even use it to store and interact
      with local data that isn't fetched from your GraphQL server.

      Apollo Client's InMemoryCache stores data as a flat lookup table of objects that can
      reference each other. These objects correspond to the objects that are returned by your
      GraphQL queries.

      Whenever the Apollo Client cache receives query response data, it does the following :

        (1) First, the cache identifies all of the distinct objects included in a query response.

        (2) After identifying all objects, the cache generates a cache ID for each one. A cache ID
          uniquely identifies a particular object while it's in the InMemoryCache.
          By default, an object's cache ID is the concatenation of the object's __typename and id
          (or _id) fields, separated by a colon (:).

        (3) Next, the cache takes each field that contains an object and replaces its value with a
          reference to the appropriate object.

        (4) Finally, the resulting objects are all stored in the cache's flat lookup table.
          Whenever an incoming object has the same cache ID as an existing cached object, the
          fields of those objects are merged
    */
		cache: new InMemoryCache({}),

		// The Apollo Link library helps you customize the flow of data between Apollo Client and your
		// GraphQL server. You can define your client's network behavior as a chain of link objects
		// that execute in a sequence.
		// Each link should represent either a self-contained modification to a GraphQL operation or a
		// side effect (such as logging). By composing these links into a chain, you can create an
		// arbitrarily complex model for your client's data flow.
		link: ApolloLink.from([
			// Automatically removes __typename fields from operation variables to prevent GraphQL
			// validation errors.
			new RemoveTypenameFromVariablesLink(),

			// Enables  the use of persisted queries, a technique that reduces bandwidth by sending query
			// hashes instead of full query strings.
			new PersistedQueryLink({ sha256 }),

			// Attempts to retry operations that fail due to network errors. It enables resilient GraphQL
			// operations by automatically retrying failed requests with configurable delay and retry
			// strategies.
			new RetryLink(),

			new HttpLink({
				uri: process.env.GRAPHQL_SERVER_ENDPOINT
			})
		])
	})
