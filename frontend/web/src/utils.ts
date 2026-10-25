import { createSafeActionClient } from "next-safe-action"

export const isProductionEnvironment = process.env.NODE_ENV === "production"

export const actionClient = createSafeActionClient({
	handleServerError: (error) => error.message
})

export const AccessTokenCookie = {
	name: "access_token",
	maxAge: 12 * 60 * 60 // 12 hours.
}
