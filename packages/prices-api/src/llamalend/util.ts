import type { Market } from "./models";

export function tvl(market?: Market) {
  return market ? market.totalAssetsUsd + market.collateralBalanceUsd : 0;
}
