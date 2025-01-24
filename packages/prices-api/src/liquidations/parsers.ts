import { toUTC } from "../timestamp";
import type * as Responses from "./responses";
import type * as Models from "./models";

export const parseSoftLiqRatio = (
  x: Responses.GetSoftLiqRatiosResponse["data"][number]
): Models.SoftLiqRatio => ({
  timestamp: toUTC(x.timestamp),
  proportion: x.proportion / 100,
});

export const parseLiqsDetailed = (
  x: Responses.GetLiqsDetailedResponse["data"][number]
): Models.LiquidationDetails => ({
  timestamp: toUTC(x.dt),
  user: x.user,
  liquidator: x.liquidator,
  self: x.self,
  collateralReceived: x.collateral_received,
  collateralReceivedUsd: x.collateral_received_usd,
  stablecoinReceived: x.stablecoin_received,
  priceOracle: x.oracle_price,
  debt: x.debt,
  n1: x.n1,
  n2: x.n2,
  tx: x.tx,
  block: x.block,
});

export const parseLiqsAggregate = (
  x: Responses.GetLiqsAggregateResponse["data"][number]
): Models.LiquidationAggregate => ({
  timestamp: toUTC(x.timestamp),
  selfCount: x.self_count,
  hardCount: x.hard_count,
  selfValue: x.self_value,
  hardValue: x.hard_value,
  price: x.price,
});

export const parseLiqOverview = (
  x: Responses.GetLiqOverviewResponse
): Models.LiqOverview => ({
  softLiqUsers: x.soft_liquidation_users,
  liqablePositions: x.liquidatable_positions,
  liqableDebtUsd: x.liquidatable_pos_debt_usd,
  liqableCollatUsd: x.liquidatable_collateral_usd,
  liqableBorrowedUsd: x.liquidatable_borrowed_usd,
  medianHealth: x.median_health,
  avgHealth: x.average_health,
  collatRatio: x.collat_ratio,
});

export const parseLiqLosses = (
  x: Responses.GetLiqLossesResponse["data"][number]
): Models.LiqLosses => ({
  timestamp: toUTC(x.timestamp),
  pctLossAverage: x.avg_pct_loss,
  pctLossMedian: x.median_pct_loss,
  absoluteLossAverage: x.avg_abs_loss,
  absoluteLossMedian: x.median_abs_loss,
  numTotalUsers: x.total_users,
  numUsersWithLosses: x.users_with_losses,
  ratio: x.ratio,
});

export const parseLiqHealthDeciles = (
  x: Responses.GetLiqHealthDecilesResponse["data"][number]
): Models.LiqHealthDecile => ({
  decile: x.health_decile,
  collateralUsdValue: x.collateral,
  debt: x.debt,
  stablecoin: x.stablecoin,
});
