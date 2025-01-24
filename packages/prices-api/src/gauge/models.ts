import type { Address, Chain } from "..";

export type Gauge = {
  address: Address;
  type: string;
  name?: string;
  version?: string;
  lpToken?: Address;
  pool?: {
    address: Address;
    name: string;
    chain: Chain;
    tvlUsd: number;
    tradingVolume24h: number;
  };
  tokens: {
    symbol: string;
    address: Address;
    precision: number;
  }[];
  market?: {
    name: string;
    chain: Chain;
  };
  killed: boolean;
  emissions: number;
  weight: bigint;
  weightDelta7d?: number;
  weightDelta60d?: number;
  weightRelative: number;
  weightRelativeDelta7d?: number;
  weightRelativeDelta60d?: number;
  creationTx: Address;
  creationDate: number;
  lastVoteTx?: Address;
  lastVoteDate?: number;
};

export type GaugeVote = {
  user: Address;
  weight: number;
  blockNumber: number;
  timestamp: number;
  tx: Address;
};

export type WeightHistory = {
  killed: boolean;
  weight: number;
  weightRelative: number;
  emissions: number;
  epoch: number;
};

export type Deployment = {
  addressFrom: Address;
  addressTo?: Address;
  calldata: string;
  calldataDecoded?: string;
  blockNumber: number;
  timestamp: number;
};

export type UserGaugeVote = {
  timestamp: number;
  gauge: Address;
  gaugeName: string;
  weight: number;
  blockNumber: number;
  txHash: Address;
};
