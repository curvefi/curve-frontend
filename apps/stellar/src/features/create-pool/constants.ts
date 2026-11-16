// stableswap-rs: factory/src/validate.rs and amm-core/src/lib.rs (UTF-8 byte lengths).
export const STELLAR_POOL_LIMITS = {
  tokens: { min: 2, max: 8 },
  amplification: { min: 1, max: 999_999 },
  fee: { min: 0, max: 1, decimals: 8 },
  feeMultiplier: { min: 1, max: 1_000, decimals: 10 },
  maxDynamicFee: 50,
  priceOracleAveragingWindow: { min: 1, max: Number.MAX_SAFE_INTEGER },
  nameMaxBytes: 64,
  symbolMaxBytes: 32,
}
