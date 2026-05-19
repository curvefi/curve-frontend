import type { Market } from './schema'

export function tvl(market?: Market) {
  return market ? market.totalAssetsUsd + market.collateralBalanceUsd : 0
}
