"use client"

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs"
import { I18nProvider, Toast } from "@heroui/react"
import { FunctionComponent, PropsWithChildren } from "react"
import { createApolloClient } from "../graphql/client"

interface Props {
	language: string
}

export const ClientSideProviders: FunctionComponent<PropsWithChildren<Props>> = ({
	language,
	children
}) => {
	return (
		<I18nProvider locale={language}>
			<ApolloNextAppProvider makeClient={createApolloClient}>{children}</ApolloNextAppProvider>
			<Toast.Provider />
		</I18nProvider>
	)
}
