import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { getAuthTokenBySteamId } from "~/data/authtoken.server"

export async function loader({ params }: LoaderArgs) {
	if (params.steamId) {
		let token = await getAuthTokenBySteamId(params.steamId)
		if (token) {
			return json({ hasToken: true })
		}
	}
	return json({ hasToken: false })
}