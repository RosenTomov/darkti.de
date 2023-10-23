import type { LinksFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	useLoaderData,
} from "@remix-run/react"
import Layout from "~/layout"

import tailwind from "~/tailwind.css"
import { authenticator } from "~/services/auth.server"

import { initJobs } from "~/jobs/index.server"
import { useRevalidateOnFocus } from "~/hooks/revalidateOnFocus"
import { ThemeProvider } from "./theme-provider"
import acceptLanguage from "accept-language-parser"
import { LocaleProvider } from "./hooks/locale"

// Sets up Cron singletons to perform timed jobs on the server
initJobs && initJobs()

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
	{
		rel: "preconnect",
		href: "https://fonts.bunny.net",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.bunny.net/css?family=archivo:900|montserrat:600,700",
	},
]

export function meta() {
	return [{ title: "Darkti.de - unofficial community tools" }]
}

function getLocale(request: Request): string {
	const languages = acceptLanguage.parse(
		request.headers.get("Accept-Language") as string,
	)

	if (!languages) {
		return "en-us"
	}

	const firstLang = languages[0]

	if (!firstLang) {
		return "en-us"
	}

	if (!firstLang.region) {
		return firstLang.code
	}

	return `${firstLang.code}-${firstLang.region.toLowerCase()}`
}

export let loader = async ({ request }: LoaderArgs) => {
	const user = await authenticator.isAuthenticated(request)
	const locale = getLocale(request)

	return json({ user, locale })
}

export default function App() {
	const { user, locale } = useLoaderData<typeof loader>()

	useRevalidateOnFocus()

	return (
		<LocaleProvider locale={locale}>
			<html lang="en" className="h-screen" suppressHydrationWarning>
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					<Meta />
					<Links />
				</head>
				<body className="h-screen">
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Layout user={user} />
					</ThemeProvider>
					<Scripts />
					<LiveReload />
				</body>
			</html>
		</LocaleProvider>
	)
}
