import type { Address } from "..";

export type Market = {
  name: string;
  address: Address;
  factory: Address;
  llamma: Address;
  rate: number;
  borrowed: number;
  borrowable: number;
  collateral: number;
  collateralUsd: number;
  debtCeiling: number;
  loans: number;
  tokenCollateral: {
    symbol: string;
    address: Address;
  };
  tokenStablecoin: {
    symbol: string;
    address: Address;
  };
  fees: {
    pending: number;
    collected: number;
  };
};

export type Snapshot = {
  timestamp: number;
  rate: number;
  nLoans: number;
  minted: number;
  redeemed: number;
  totalCollateral: number;
  totalCollateralUsd: number;
  totalStablecoin: number;
  totalDebt: number;
  priceAMM: number;
  priceOracle: number;
  borrowable: number;
  discountLiquidation: number;
  discountLoan: number;
};

export type PoolPrice = {
  timestamp: number;
  [token: string]: number;
};

export type PriceHistogram = {
  x: number[];
  y: number[];
};

export type CrvUsdSupply = {
  timestamp: number;
  market: string;
  supply: number;
  borrowable: number;
};

export type Keeper = {
  address: Address;
  pool: string;
  poolAddress: Address;
  pair: {
    symbol: string;
    address: Address;
  }[];
  active: boolean;
  totalDebt: number;
  totalProfit: number;
};

/** More specifically, the markets where a user holds a position */
export type UserMarkets = {
  collateral: string;
  controller: string;
  snapshotFirst: number;
  snapshotLast: number;
}[];

export type UserMarketStats = {
  health: number;
  healthFull: number;
  n1: number;
  n2: number;
  n: number;
  debt: number;
  collateral: number;
  stablecoin: number;
  softLiquidation: boolean;
  totalDeposited: number;
  loss: number;
  lossPct: number;
  collateralUp: number;
  oraclePrice: number;
  blockNumber: number;
  timestamp: number;
};

export type UserMarketSnapshots = UserMarketStats[];

export type UserCollateralEvents = {
  controller: Address;
  user: Address;
  totalDeposit: number;
  totalDepositPrecise: string;
  totalDepositUsd: number;
  totalBorrowed: number;
  totalBorrowedPrecise: string;
  events: {
    timestamp: number;
    txHash: string;
    type: "Borrow" | "Deposit";
    user: Address;
    collateralChange: number;
    collateralChangeUsd?: number;
    loanChange: number;
    loanChangeUsd?: number;
    liquidation?: {
      user: Address;
      liquidator: Address;
      collateralReceived: number;
      collateralReceivedUsd: number;
      stablecoinReceived: number;
      debt: number;
    };
    n1: number;
    n2: number;
    oraclePrice: number;
  }[];
};
