import fastify from "fastify"
import { remixFastifyPlugin } from "@mcansh/remix-fastify"
import { installGlobals } from "@remix-run/node"

import * as serverBuild from "./build/index.mjs"

installGlobals()

let MODE = process.env.NODE_ENV

let app = fastify({
	logger: {
		transport: {
			target: "@fastify/one-line-logger",
		},
	},
})

// TODO: Figure out cors for images
// await app.register(import("@fastify/helmet"), { global: true })

// BLOCKED: https://github.com/mcansh/remix-fastify/pull/100
// await app.register(import("@fastify/compress"), { global: true })

await app.register(import("@fastify/cookie"))
await app.register(import("@fastify/session"), {
	secret: process.end.SECRETSECRET,
})

await app.register(remixFastifyPlugin, {
	build: serverBuild,
	mode: MODE,
	getLoadContext: () => ({ loadContextName: "John Doe" }),
	purgeRequireCacheInDevelopment: true,
	unstable_earlyHints: true,
})

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000

let address = await app.listen({ port, host: "0.0.0.0" })
console.log(`App server running on ${address}`)

if (MODE === "development") {
	let { broadcastDevReady } = await import("@remix-run/node")
	broadcastDevReady(serverBuild)
}