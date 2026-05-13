// `isGetter` flag for market.stats.* calls: `true` uses the library cache getter path, `false` forces fresh multicall
export const IS_GETTER = false
// `false` keeps market stats reads on-chain/multicall instead of using the API response
export const USE_API = false
