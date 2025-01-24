import { chains, type Chain } from "..";
import { toUTC } from "../timestamp";
import type * as Responses from "./responses";
import type * as Models from "./models";

export const parseSupportedChains = (
  x: Responses.GetSupportedChainsResponse
): Chain[] =>
  x.data.map((y) => y.name as Chain).filter((y) => chains.includes(y));

export const parseChainInfo = (
  x: Responses.GetChainInfoResponse
): Models.ChainInfo => ({
  chain: x.chain,
  total: {
    tvl: x.total.total_tvl,
    tradingVolume24h: x.total.trading_volume_24h,
    tradingFee24h: x.total.trading_fee_24h,
    liquidityVolume24h: x.total.liquidity_volume_24h,
    liquidityFee24h: x.total.liquidity_fee_24h,
  },
});

export const parseTxs = (
  x: Responses.GetTransactionsResponse
): Models.Transactions[] =>
  x.data.flatMap((data) =>
    data.transactions.map((tx) => ({
      chain: data.chain,
      timestamp: toUTC(tx.timestamp),
      type: tx.type,
      transactions: tx.transactions,
    }))
  );

export const parseUsers = (x: Responses.GetUsersResponse): Models.Users[] =>
  x.data.flatMap((data) =>
    data.users.map((tx) => ({
      chain: data.chain,
      timestamp: toUTC(tx.timestamp),
      type: tx.type,
      users: tx.users,
    }))
  );
