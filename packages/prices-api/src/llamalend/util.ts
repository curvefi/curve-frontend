import type { Market } from './schema'

export const tvl = (market?: Market) => (market ? market.totalAssetsUsd + market.collateralBalanceUsd : 0)
