import type { Address } from "..";

type Deposit = {
  amount: number;
  n1: number;
  n2: number;
};

type Withdrawal = {
  amountBorrowed: number;
  amountCollateral: number;
};

export type LlammaEvent = {
  provider: Address;
  deposit?: Deposit | null;
  withdrawal?: Withdrawal | null;
  blockNumber: number;
  timestamp: number;
  txHash: Address;
};

export type LlammaTrade = {
  idSold: number;
  idBought: number;
  tokenSold: {
    symbol: string;
    address: Address;
  };
  tokenBought: {
    symbol: string;
    address: Address;
  };
  amountSold: number;
  amountBought: number;
  price: number;
  buyer: Address;
  feeX: number;
  feeY: number;
  blockNumber: number;
  timestamp: number;
  txHash: Address;
};

export type LlammaOHLC = {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  priceBase: number;
  priceOracle: number;
  volume: number;
};
