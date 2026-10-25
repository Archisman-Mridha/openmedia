import "server-only"

import { registerApolloClient } from "@apollo/client-integration-nextjs"
import { createApolloClient } from "./client"

export const { getClient, query, PreloadQuery } = registerApolloClient(createApolloClient)
