import type { Chain } from "..";
import { toUTC } from "../timestamp";
import type * as Responses from "./responses";
import type * as Models from "./models";

export const parseChainRevenue = (
  x: Responses.GetByChainResponse["revenue"][number]
): Models.ChainRevenue => ({
  chain: x.chain,
  totalDailyFeesUSD: x.totalDailyFeesUSD,
});

export const parseTopPools = (
  x: Responses.GetTopPoolsResponse["revenue"][number]
): Models.ChainTopPoolRevenue => ({
  name: x.name,
  totalDailyFeesUSD: x.totalDailyFeesUSD,
});

export const parseCrvUsdWeekly = (
  x: Responses.GetCrvUsdWeeklyResponse["fees"][number]
): Models.CrvUsdWeekly => ({
  timestamp: toUTC(x.timestamp),
  controller: x.controller,
  collateral: x.collateral,
  feesUsd: x.fees_usd,
});

export const parsePoolsWeekly = (
  x: Responses.GetPoolsWeeklyResponse["fees"][number]
): Models.PoolsWeekly => ({
  timestamp: toUTC(x.timestamp),
  chain: x.chain as Chain,
  feesUsd: x.fees_usd,
});

export const parseCushion = (
  x: Responses.GetCushionsResponse["data"][number]
): Models.Cushion => ({
  pool: x.pool,
  name: x.name,
  adminFees: x.admin_fees,
  usdValue: x.usd_value,
});

export const parseDistribution = (
  x: Responses.GetDistributionsResponse["distributions"][number]
): Models.Distribution => ({
  timestamp: toUTC(x.timestamp),
  feesUsd: x.fees_usd,
});

export const parseCowSwapSettlement = (
  x: Responses.GetCowSwapSettlementsResponse["data"][number]
): Models.CowSwapSettlement => ({
  timestamp: toUTC(x.dt),
  coin: {
    lpToken: x.coin.lp_token,
    symbol: x.coin.symbol,
    address: x.coin.address,
    precision: x.coin.precision,
  },
  amount: BigInt(x.amount),
  amountFee: BigInt(x.fee_amount),
  amountReceived: x.amount_received,
  routerReceived: x.router_received,
  epoch: x.epoch,
  txHash: x.tx_hash,
  blockNumber: x.block_number,
});

export const parseFeesCollected = (
  x: Responses.GetFeesCollectedResponse["data"][number]
): Models.FeesCollected => ({
  coin: {
    lpToken: x.coin.lp_token,
    symbol: x.coin.symbol,
    address: x.coin.address,
    decimals: x.coin.precision,
  },
  amount: parseFloat(x.amount),
  amountUsd: parseFloat(x.usd_amount),
});

export const parseFeesStaged = (
  x: Responses.GetFeesStagedResponse["data"][number]
): Models.FeesStaged => ({
  coin: {
    lpToken: x.coin.lp_token,
    symbol: x.coin.symbol,
    address: x.coin.address,
    decimals: x.coin.precision,
  },
  amount: parseFloat(x.amount),
  amountUsd: parseFloat(x.usd_amount),
});
