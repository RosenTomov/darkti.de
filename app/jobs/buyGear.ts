import { getAuthTokenBySteamId } from "~/services/db/authtoken.server"
import {
	getAccountSummary,
	getCharacterStore,
	purchaseItem,
} from "~/services/darktide.server"

const buyGear = async () => {
	try {
		const auth = await getAuthTokenBySteamId(process.env.DEFAULT_STEAM_ID!)
		const accountSummary = await getAccountSummary(auth)

		if (!accountSummary) {
			console.log("Authentication failed")
			return
		}

		const characters = accountSummary?.summary.characters

		if (characters?.length) {
			for await (const character of characters) {
				const charStore = await getCharacterStore(
					auth,
					character.archetype,
					character.id,
					"credits",
				)

				if (charStore?.personal) {
					for await (const item of charStore.personal) {
						const baseRating = item?.description.overrides.baseItemLevel

						if (
							(baseRating === 380 || baseRating === 80) &&
							item?.state !== "completed" &&
							item?.offerId
						) {
							await purchaseItem(auth, {
								catalogId: charStore.catalog.id,
								storeName: charStore.name,
								characterId: character.id,
								offerId: item.offerId,
								ownedSkus: [],
							})
						}
					}
				} else {
					console.log("Missing character data.")
				}
			}
		} else {
			console.log("No characters found.")
		}
	} catch (error) {
		console.log("Failed to buy gear", error)
	}
}

export default buyGear
