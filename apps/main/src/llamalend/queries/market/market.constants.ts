// `isGetter` flag for market.stats.* calls: `true` uses the library cache getter path, `false` forces fresh multicall
export const IS_GETTER = false

/*
 * Keeps market stats reads on-chain/multicall instead of using the API response.
 * Llamalend library is basically only used in the detail pages where the user wants to interact with the chain directly.
 * Ideally, the library should *optionally* be receiving *our* API data (when we have it) instead of fetching again.
 */
export const USE_API = false
