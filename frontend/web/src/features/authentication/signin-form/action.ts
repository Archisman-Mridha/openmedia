"use server"

import { signinArgsValidator } from "@openmedia/packages/validators"
import { SigninDocument } from "@openmedia/web/src/graphql/generated/graphql"
import { getClient } from "@openmedia/web/src/graphql/server-side-client"
import { AccessTokenCookie, actionClient, isProductionEnvironment } from "@openmedia/web/src/utils"
import { cookies } from "next/headers"

export const signinAction = actionClient
	.inputSchema(signinArgsValidator)
	.action(async ({ parsedInput }) => {
		const { data, error } = await getClient().query({
			query: SigninDocument,
			variables: { args: parsedInput },

			errorPolicy: "all"
		})

		if (error || !data) throw error

		const { userID, accessToken } = data.signin

		const cookiesStore = await cookies()

		// Store the access token in a cookie.
		cookiesStore.set(AccessTokenCookie.name, accessToken, {
			httpOnly: true,
			secure: isProductionEnvironment,

			maxAge: AccessTokenCookie.maxAge
		})

		return { userID }
	})
