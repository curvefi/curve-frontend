export const STABLE_SWAP_ERRORS = {
  10000: {
    title: 'InputCoinCountMismatch',
    description:
      'A per-coin vector (constructor `tokens`/`asset_types`, or an `amounts`/`min_amounts`) is not exactly `COINS` long.',
  },
  10001: { title: 'InputCoinIndexOutOfRange', description: 'Coin index is not in `0..COINS`.' },
  10002: { title: 'InputDuplicateCoinIndex', description: 'A swap needs two different coins.' },
  10003: {
    title: 'InputZeroAmount',
    description: 'The input amount is zero (vs `MarketLpRoundsToZero`, which is nonzero but too small).',
  },
  10004: { title: 'InputNegativeAmount', description: "A negative amount; the engine's arithmetic is unsigned." },
  10005: { title: 'InputFeeOutOfRange', description: '`fee` is outside `0..=MAX_FEE`.' },
  10006: { title: 'InputAdminFeeOutOfRange', description: '`admin_fee` is outside `0..FEE_DENOMINATOR`.' },
  10007: {
    title: 'InputOffpegMultiplierOutOfRange',
    description: '`offpeg_fee_multiplier` is unsupported or would make the dynamic fee exceed its maximum.',
  },
  10008: { title: 'InputAmplificationOutOfRange', description: 'Amplification is outside `1..MAX_A`.' },
  10009: { title: 'InputRampDurationTooShort', description: 'A ramp must run at least `MIN_RAMP_TIME`.' },
  10010: { title: 'InputTooManyDecimals', description: 'A coin reports more decimals than `PRECISION_DECIMALS`.' },
  10011: {
    title: 'InputDuplicateCoinAddress',
    description: 'The same token address appears more than once in the coin list.',
  },
  10012: { title: 'InputReceiverIsPool', description: 'The payout receiver is the pool itself.' },
  10013: {
    title: 'InputCallerIsPool',
    description: 'The pool named itself as the caller, which would spend or burn its own locked liquidity.',
  },
  10014: { title: 'InputMetadataTooLong', description: "The LP token's `name` or `symbol` is too long." },
  10015: {
    title: 'InputMinLockedLiquidityOutOfRange',
    description: '`min_locked_liquidity` is negative. Zero is legal and means the pool locks nothing.',
  },
  10016: { title: 'InputOracleWindowOutOfRange', description: 'An oracle averaging window is zero.' },
  10200: { title: 'StateNotInitialized', description: 'Called before the constructor ran.' },
  10201: { title: 'StateLpSupplyEmpty', description: 'The operation needs liquidity, and the LP supply is zero.' },
  10202: { title: 'StateReserveEmpty', description: 'A reserve is zero; the invariant is undefined there.' },
  10203: {
    title: 'StateRampTooSoon',
    description: 'A ramp was requested before `MIN_RAMP_TIME` elapsed since the last one.',
  },
  10204: {
    title: 'StateAmplificationChangeTooLarge',
    description: 'The ramp would change amplification by more than `MAX_A_CHANGE`× from its current value.',
  },
  10205: { title: 'StatePoolTooImbalanced', description: 'Reserves exceed the supported imbalance.' },
  10206: {
    title: 'StateNotFactoryDeployed',
    description: "The stored Factory and salt do not derive this contract's address: not a Factory deployment.",
  },
  10207: {
    title: 'StateDonationNotNeeded',
    description: 'Donations are disabled when the current spread and invariant checks pass.',
  },
  10208: { title: 'StateOracleNotInitialized', description: 'Oracle reads require nonzero LP supply.' },
  10300: {
    title: 'MarketSlippageExceeded',
    description: 'The caller would get less, or pay more, than the bound they set.',
  },
  10301: {
    title: 'MarketLpRoundsToZero',
    description: 'A real input too small to mint or burn any LP; a larger one may succeed.',
  },
  10302: {
    title: 'MarketBurnExceedsSupply',
    description: 'The LP burn exceeds total supply — a claim on more than the pool holds.',
  },
  10303: {
    title: 'MarketInsufficientLpBalance',
    description: 'The burner does not hold the LP being burned (vs `MarketBurnExceedsSupply`, the whole pool).',
  },
  10304: {
    title: 'MarketInsufficientLiquidity',
    description: 'The requested output or withdrawal exceeds what the coin reserve can pay; retry with less.',
  },
  10305: {
    title: 'MarketInitialDepositTooSmall',
    description: 'Initial deposit is too small to fund the locked liquidity, a larger one may succeed.',
  },
  10306: {
    title: 'MarketDonationAboveLimit',
    description: "A donation would put a coin's normalized balance (`xp`) above the prior pool maximum.",
  },
  10400: {
    title: 'ExtTokenPullFailed',
    description: "A coin's token rejected a transfer *into* the pool (payer's balance/allowance/trustline).",
  },
  10401: {
    title: 'ExtTokenPushFailed',
    description: "A coin's token rejected a transfer *out of* the pool. Not the caller's fault; escalate.",
  },
  10402: {
    title: 'ExtTokenUnusable',
    description:
      "A coin's token gave an unusable response — trapped or undecodable. Its foreign error code is discarded, not re-raised.",
  },
  10403: { title: 'ExtTokenBadMetadata', description: "A coin's token would not report usable `decimals`." },
  10404: {
    title: 'ExtFactoryUnavailable',
    description: 'The bound Factory could not be reached to resolve admin / fee receiver.',
  },
  10405: { title: 'ExtTrustlineCreationFailed', description: 'A missing SAC trustline could not be opened.' },
  10501: {
    title: 'UnimplementedRateOracle',
    description: 'This implementation supports only `ASSET_TYPE_PLAIN`, with no rate-oracle `methods` or `oracles`.',
  },
  10800: { title: 'MathNotConverged', description: 'Newton iteration did not converge inside its cap; retry smaller.' },
  10801: {
    title: 'MathArithmetic',
    description:
      'Checked arithmetic overflowed or underflowed. Reserve exhaustion on a withdrawal is `MarketInsufficientLiquidity` (10304), not this — that condition is caught before the math.',
  },
  10900: { title: 'Internal', description: 'A postcondition this contract guarantees did not hold.' },
  10901: {
    title: 'InternalStorageMalformed',
    description: "Stored pool vectors disagree with this wasm's coin count.",
  },
  10902: {
    title: 'InternalStoredParamsInvalid',
    description: "The engine rejected the pool's own stored params (fee, `A`, admin fee, or rate).",
  },
  10903: {
    title: 'InternalLpSupplyDrift',
    description: "The LP token's `total_supply` diverged from the engine's `lp_supply`.",
  },
  10904: { title: 'InternalValueUnrepresentable', description: 'An engine value did not fit a host `i128`.' },
  10905: {
    title: 'InternalVirtualPriceDropped',
    description:
      "The planned transition would have lowered the invariant per LP token — LP principal leaking out. The engine's guardrail refused the plan; nothing was written.",
  },
} as const
