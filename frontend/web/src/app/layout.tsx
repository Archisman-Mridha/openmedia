import type { Metadata } from "next"
import "./global.css"
import { isRTL } from "@heroui/react"
import { headers } from "next/headers"
import { ClientSideProviders } from "./provider"

export const metadata: Metadata = {
	title: "Openmedia",
	description:
		"Demonstrating distributed systems development by building OpenMedia : an extremely simple social media"
}

export const instant = false

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Get the user's preferred language from the Accept-Language header.
	const acceptLanguage = (await headers()).get("accept-language")
	const language = acceptLanguage?.split(/[,;]/)[0] || "en-US"

	return (
		<html lang={language} dir={isRTL(language) ? "rtl" : "ltr"} className="dark" data-theme="dark">
			<body className="bg-background text-foreground">
				<ClientSideProviders language={language}>{children}</ClientSideProviders>
			</body>
		</html>
	)
}
