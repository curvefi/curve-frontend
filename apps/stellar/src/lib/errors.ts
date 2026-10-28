type Error = { code: number; title: string; description: string }

export const StableSwapErrors = [
  {
    title: 'InputCoinCountMismatch',
    code: 10000,
    description:
      'A per-coin vector (constructor `tokens`/`asset_types`, or an `amounts`/`min_amounts`) is not exactly `COINS` long.',
  },
  { title: 'InputCoinIndexOutOfRange', code: 10001, description: 'Coin index is not in `0..COINS`.' },
  { title: 'InputDuplicateCoinIndex', code: 10002, description: 'A swap needs two different coins.' },
  {
    title: 'InputZeroAmount',
    code: 10003,
    description: 'The input amount is zero (vs `MarketLpRoundsToZero`, which is nonzero but too small).',
  },
  { title: 'InputNegativeAmount', code: 10004, description: "A negative amount; the engine's arithmetic is unsigned." },
  { title: 'InputFeeOutOfRange', code: 10005, description: '`fee` is outside `0..=MAX_FEE`.' },
  { title: 'InputAdminFeeOutOfRange', code: 10006, description: '`admin_fee` is outside `0..FEE_DENOMINATOR`.' },
  {
    title: 'InputOffpegMultiplierOutOfRange',
    code: 10007,
    description: '`offpeg_fee_multiplier` is unsupported or would make the dynamic fee exceed its maximum.',
  },
  { title: 'InputAmplificationOutOfRange', code: 10008, description: 'Amplification is outside `1..MAX_A`.' },
  { title: 'InputRampDurationTooShort', code: 10009, description: 'A ramp must run at least `MIN_RAMP_TIME`.' },
  {
    title: 'InputTooManyDecimals',
    code: 10010,
    description: 'A coin reports more decimals than `PRECISION_DECIMALS`.',
  },
  {
    title: 'InputDuplicateCoinAddress',
    code: 10011,
    description: 'The same token address appears more than once in the coin list.',
  },
  { title: 'InputReceiverIsPool', code: 10012, description: 'The payout receiver is the pool itself.' },
  {
    title: 'InputCallerIsPool',
    code: 10013,
    description: 'The pool named itself as the caller, which would spend or burn its own locked liquidity.',
  },
  { title: 'InputMetadataTooLong', code: 10014, description: "The LP token's `name` or `symbol` is too long." },
  {
    title: 'InputMinLockedLiquidityOutOfRange',
    code: 10015,
    description: '`min_locked_liquidity` is negative. Zero is legal and means the pool locks nothing.',
  },
  { title: 'InputOracleWindowOutOfRange', code: 10016, description: 'An oracle averaging window is zero.' },
  { title: 'StateNotInitialized', code: 10200, description: 'Called before the constructor ran.' },
  {
    title: 'StateLpSupplyEmpty',
    code: 10201,
    description: 'The operation needs liquidity, and the LP supply is zero.',
  },
  { title: 'StateReserveEmpty', code: 10202, description: 'A reserve is zero; the invariant is undefined there.' },
  {
    title: 'StateRampTooSoon',
    code: 10203,
    description: 'A ramp was requested before `MIN_RAMP_TIME` elapsed since the last one.',
  },
  {
    title: 'StateAmplificationChangeTooLarge',
    code: 10204,
    description: 'The ramp would change amplification by more than `MAX_A_CHANGE`× from its current value.',
  },
  { title: 'StatePoolTooImbalanced', code: 10205, description: 'Reserves exceed the supported imbalance.' },
  {
    title: 'StateNotFactoryDeployed',
    code: 10206,
    description: "The stored Factory and salt do not derive this contract's address: not a Factory deployment.",
  },
  {
    title: 'StateDonationNotNeeded',
    code: 10207,
    description: 'Donations are disabled when the current spread and invariant checks pass.',
  },
  { title: 'StateOracleNotInitialized', code: 10208, description: 'Oracle reads require nonzero LP supply.' },
  {
    title: 'MarketSlippageExceeded',
    code: 10300,
    description: 'The caller would get less, or pay more, than the bound they set.',
  },
  {
    title: 'MarketLpRoundsToZero',
    code: 10301,
    description: 'A real input too small to mint or burn any LP; a larger one may succeed.',
  },
  {
    title: 'MarketBurnExceedsSupply',
    code: 10302,
    description: 'The LP burn exceeds total supply — a claim on more than the pool holds.',
  },
  {
    title: 'MarketInsufficientLpBalance',
    code: 10303,
    description: 'The burner does not hold the LP being burned (vs `MarketBurnExceedsSupply`, the whole pool).',
  },
  {
    title: 'MarketInsufficientLiquidity',
    code: 10304,
    description: 'The requested output or withdrawal exceeds what the coin reserve can pay; retry with less.',
  },
  {
    title: 'MarketInitialDepositTooSmall',
    code: 10305,
    description: 'Initial deposit is too small to fund the locked liquidity, a larger one may succeed.',
  },
  {
    title: 'MarketDonationAboveLimit',
    code: 10306,
    description: "A donation would put a coin's normalized balance (`xp`) above the prior pool maximum.",
  },
  {
    title: 'ExtTokenPullFailed',
    code: 10400,
    description: "A coin's token rejected a transfer *into* the pool (payer's balance/allowance/trustline).",
  },
  {
    title: 'ExtTokenPushFailed',
    code: 10401,
    description: "A coin's token rejected a transfer *out of* the pool. Not the caller's fault; escalate.",
  },
  {
    title: 'ExtTokenUnusable',
    code: 10402,
    description:
      "A coin's token gave an unusable response — trapped or undecodable. Its foreign error code is discarded, not re-raised.",
  },
  { title: 'ExtTokenBadMetadata', code: 10403, description: "A coin's token would not report usable `decimals`." },
  {
    title: 'ExtFactoryUnavailable',
    code: 10404,
    description: 'The bound Factory could not be reached to resolve admin / fee receiver.',
  },
  { title: 'ExtTrustlineCreationFailed', code: 10405, description: 'A missing SAC trustline could not be opened.' },
  {
    title: 'UnimplementedRateOracle',
    code: 10501,
    description: 'This implementation supports only `ASSET_TYPE_PLAIN`, with no rate-oracle `methods` or `oracles`.',
  },
  {
    title: 'MathNotConverged',
    code: 10800,
    description: 'Newton iteration did not converge inside its cap; retry smaller.',
  },
  {
    title: 'MathArithmetic',
    code: 10801,
    description:
      'Checked arithmetic overflowed or underflowed. Reserve exhaustion on a withdrawal is `MarketInsufficientLiquidity` (10304), not this — that condition is caught before the math.',
  },
  { title: 'Internal', code: 10900, description: 'A postcondition this contract guarantees did not hold.' },
  {
    title: 'InternalStorageMalformed',
    code: 10901,
    description: "Stored pool vectors disagree with this wasm's coin count.",
  },
  {
    title: 'InternalStoredParamsInvalid',
    code: 10902,
    description: "The engine rejected the pool's own stored params (fee, `A`, admin fee, or rate).",
  },
  {
    title: 'InternalLpSupplyDrift',
    code: 10903,
    description: "The LP token's `total_supply` diverged from the engine's `lp_supply`.",
  },
  { title: 'InternalValueUnrepresentable', code: 10904, description: 'An engine value did not fit a host `i128`.' },
  {
    title: 'InternalVirtualPriceDropped',
    code: 10905,
    description:
      "The planned transition would have lowered the invariant per LP token — LP principal leaking out. The engine's guardrail refused the plan; nothing was written.",
  },
] satisfies Error[]
