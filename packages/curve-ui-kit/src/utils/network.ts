/**
 * List of all hardcoded chains IDs. Does not include Lite chains.
 * TODO: use object as const instead of enum
 */
export enum Chain {
  Ethereum = 1,
  Optimism = 10,
  Gnosis = 100,
  Moonbeam = 1284,
  Polygon = 137,
  Kava = 2222,
  Fantom = 250,
  Arbitrum = 42161,
  Avalanche = 43114,
  Celo = 42220,
  Aurora = 1313161554,
  ZkSync = 324,
  Base = 8453,
  Bsc = 56,
  Fraxtal = 252,
  XLayer = 196,
  Mantle = 5000,
  Sonic = 146,
  Hyperliquid = 999,
  Xdc = 50,
  Tac = 2390,
  Corn = 21000000,
  Ink = 57073,
  Taiko = 167000,
  Plume = 98866,
  MegaEth = 6342,
  Strata = 8091,
  ExpChain = 18880,
}

/**
 * Constant used to identify chain IDs. It should be expanded to include all supported chains.
 */
export const ChainIds = {
  Hyperliquid: 999,
} as const
