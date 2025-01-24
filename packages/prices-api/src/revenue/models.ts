import type { Address, Chain } from "..";

export type ChainRevenue = {
  chain: string;
  totalDailyFeesUSD: number;
};

export type ChainTopPoolRevenue = {
  name: string;
  totalDailyFeesUSD: number;
};

export type CrvUsdWeekly = {
  timestamp: number;
  controller: Address;
  collateral: string;
  feesUsd: number;
};

export type PoolsWeekly = {
  timestamp: number;
  chain: Chain;
  feesUsd: number;
};

export type Cushion = {
  pool: Address;
  name: string;
  adminFees: number[];
  usdValue: number;
};

export type Distribution = {
  timestamp: number;
  feesUsd: number;
};

export type CowSwapSettlement = {
  timestamp: number;
  coin: {
    lpToken: boolean;
    symbol: string;
    address: Address;
    precision: number;
  };
  amount: bigint;
  amountFee: bigint;
  amountReceived: number;
  routerReceived: number;
  epoch: number;
  txHash: Address;
  blockNumber: number;
};

type Fees = {
  coin: {
    lpToken: boolean;
    symbol: string;
    address: Address;
    decimals: number;
  };
  amount: number;
  amountUsd: number;
};

export type FeesCollected = Fees;
export type FeesStaged = Fees;
