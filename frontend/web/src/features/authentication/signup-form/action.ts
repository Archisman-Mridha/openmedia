"use server"

import { signupArgsValidator } from "@openmedia/packages/validators"
import { SignupDocument } from "@openmedia/web/src/graphql/generated/graphql"
import { getClient } from "@openmedia/web/src/graphql/server-side-client"
import { AccessTokenCookie, actionClient, isProductionEnvironment } from "@openmedia/web/src/utils"
import { cookies } from "next/headers"

export const signupAction = actionClient
	.inputSchema(signupArgsValidator)
	.action(async ({ parsedInput }) => {
		const { data, error } = await getClient().mutate({
			mutation: SignupDocument,
			variables: { args: parsedInput },

			/*
        If a GraphQL operation produces one or more GraphQL errors, your server's response might
        still include partial data in the data field.

        By default, Apollo Client throws away partial data and populates the error field of the
        useQuery hook (or whichever hook you're using). You can instead use these partial results
        by defining an error policy for your operation.

        The all error policy allows promises to resolve successfully even when errors occur.
        Access the error in the error field on the returned result.
      */
			errorPolicy: "all"
		})

		if (error || !data) throw error

		const { userID, accessToken } = data.signup

		// cookies is an async function that allows you to read the HTTP incoming request cookies in
		// Server Components, and read/write outgoing request cookies in Server Functions or Route
		// Handlers.
		const cookiesStore = await cookies()

		// Store the access token in a cookie.
		cookiesStore.set(AccessTokenCookie.name, accessToken, {
			// Restricts the cookie to HTTP requests, preventing client-side access.
			httpOnly: true,

			// Ensures the cookie is sent only over HTTPS connections for added security.
			secure: isProductionEnvironment,

			// The cookie’s lifespan in seconds.
			maxAge: AccessTokenCookie.maxAge
		})

		return { userID }
	})
