import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
	schema: "../../generated/schema.graphql",
	documents: ["src/graphql/documents/**/*.graphql"],
	// Don't exit with non-zero status when there are no documents.
	ignoreNoDocuments: true,
	generates: {
		// Without a preset, plugins write to a single file, so the output must be a .ts file and not
		// a directory.
		"./src/graphql/generated/graphql.ts": {
			// We do not recommend using the client preset with Apollo Client apps because it generates
			// additional runtime code that adds bundle size to your application and includes features
			// that are incompatible with Apollo Client.
			/*
        // The client preset provides typed GraphQL operations (Query, Mutation and Subscription) by
        // perfectly integrating with your favorite GraphQL clients.
        preset: "client",
        presetConfig: {
          // Persisted documents (often also referred to as persisted queries or persisted
          // operations) is a technique for reducing client to server upstream traffic by sending a
          // unique identifier instead of the full GraphQL document. It is also commonly used to
          // reduce the size of the client bundle as well as to improve security by preventing the
          // client from sending and executing arbitrary GraphQL operations (and thus reducing attack
          // surface).
          persistedDocuments: true
        },
      */

			plugins: [
				"typescript-operations",

				// The gql template literal tag is used in Apollo Client apps to define GraphQL documents
				// for use with Apollo Client APIs. Its purpose is to parse the GraphQL string into a
				// standard GraphQL AST. Parsing occurs when the module is executed which adds startup
				// time to your application. Additionally, the GraphQL document returned by gql is typed as
				// a DocumentNode which doesn't include type information about its data or variables.
				"typed-document-node"
			],

			config: {
				// Apollo Client always includes '__typename' fields
				nonOptionalTypename: true,

				// Apollo Client doesn't add the '__typename' field to root types so don't generate a type
				// for the '__typename' for root operation types.
				skipTypeNameForRoot: true
			}
		}
	}
}

export default config
