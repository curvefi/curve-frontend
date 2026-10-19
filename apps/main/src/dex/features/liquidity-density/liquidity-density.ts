import { maxBy, minBy } from 'lodash'
import type { Pool, PoolMetadata, PoolSnapshot } from '@curvefi/prices-api/pools'
import { maybe, notFalsy, range } from '@primitives/objects.utils'
import { isPositiveFinite, isValidPair, peakPrice, spotPrice } from '@ui/features/pools/liquidity-density/curve'
import { liquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { createTriCryptoCurve } from '@ui/features/pools/liquidity-density/tricrypto'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'
import type {
  LiquidityCurve,
  LiquidityPair,
  LiquidityProfile,
  LiquidityProfileOptions,
} from '@ui/features/pools/liquidity-density/types'
import { fromWei, toWei } from '@ui/lib/decimal'
import type { PoolLiquidityQuote } from './queries/pool-liquidity-quote.query'
import type { PoolLiquidityState } from './queries/pool-liquidity-state.query'

// Contract/SDK scales differ by family, even where their numeric values coincide.
const STABLESWAP_A_PRECISION = 100
const CRYPTOSWAP_A_PRECISION = 10_000
const LEGACY_TRICRYPTO_A_PRECISION = 100
const CRYPTO_INVARIANT_DECIMALS = 18
const FEE_PERCENT_SCALE = 100
const STANDARD_ASSET_TYPE = 0
/** Probe one millionth of the reserve and accept at most 1% relative error against its fee-adjusted price. */
const QUOTE_PROBE_DIVISOR = 1_000_000n
const MAX_RELATIVE_QUOTE_ERROR = 0.01

type LiquidityFamily = 'stableswap' | 'twocrypto' | 'twocrypto-legacy' | 'fxswap' | 'tricrypto' | 'tricrypto-legacy'

export type PoolLiquidityResult = LiquidityProfile & {
  source: 'api' | 'rpc'
  family: LiquidityFamily
  centerPrice?: number
  oraclePrice?: number
  /** Relative difference from a small fee-adjusted onchain quote, when connected. */
  quoteError?: number
}

/** Returns no profile when API data cannot describe the pool or the solver cannot follow the curve. */
export const processApiLiquidity = (
  { numCoins, balances, coins }: Pool,
  { poolType, metapool, assetTypes, coins: metadataCoins }: PoolMetadata,
  snapshots: readonly PoolSnapshot[],
  pair: LiquidityPair,
  options?: LiquidityProfileOptions,
): PoolLiquidityResult | undefined => {
  if (
    poolType !== 'stableswapng' ||
    metapool ||
    assetTypes?.length !== numCoins ||
    !assetTypes.every(type => type === STANDARD_ASSET_TYPE)
  ) {
    return undefined
  }

  if (balances.length !== numCoins || metadataCoins.length !== numCoins || coins.length !== numCoins) {
    return undefined
  }
  const coinsMatch = range(numCoins).every(index => {
    const { address } = coins.find(({ poolIndex }) => poolIndex === index) ?? {}
    const { address: metadataAddress } = metadataCoins.find(({ poolIndex }) => poolIndex === index) ?? {}
    return address != null && address.toLowerCase() === metadataAddress?.toLowerCase()
  })
  if (!coinsMatch) return undefined

  // Do not fill holes in the newest snapshot with parameters from another block.
  const { a } = maxBy(snapshots, 'timestamp') ?? {}
  if (a == null) return undefined

  // API balances are already whole tokens. For NG, A() is A_precise / STABLESWAP_A_PRECISION.
  const curve = createStableSwapCurve(
    balances,
    balances.map(() => 1),
    a,
  )
  if (!curve) return undefined
  const profile = liquidityProfile(curve, pair, options)
  if (!profile) return undefined
  return { ...profile, source: 'api', family: 'stableswap', centerPrice: peakPrice(curve, pair) }
}

/** flet-curve-demo/src/ui/pool_detail.py: _quoted_price uses one millionth of the input reserve. */
export const liquidityProbeAmount = (
  { isLending, isLlamma, balances, wrappedDecimals }: PoolLiquidityState,
  inputCoin: number,
): string | undefined => {
  if (isLending || isLlamma) return undefined
  const balance = balances[inputCoin]
  const decimals = wrappedDecimals[inputCoin]
  if (balance == null || decimals == null || +balance <= 0) return undefined
  const rawBalance = BigInt(toWei(balance, decimals))
  if (rawBalance <= 0n) return undefined
  const amount = rawBalance / QUOTE_PROBE_DIVISOR
  return (amount > 0n ? amount : 1n).toString()
}

const quotedPrice = (
  { wrappedDecimals, parameters: { fee: feePercent } }: PoolLiquidityState,
  { inputCoin: quoteInputCoin, outputCoin: quoteOutputCoin, inputAmount, outputAmount }: PoolLiquidityQuote,
  [inputCoin, outputCoin]: LiquidityPair,
) => {
  if (quoteInputCoin !== inputCoin || quoteOutputCoin !== outputCoin) {
    return undefined
  }
  const input = +fromWei(inputAmount, wrappedDecimals[inputCoin])
  const output = +fromWei(outputAmount, wrappedDecimals[outputCoin])
  if (!isPositiveFinite(input)) return undefined // Quoted input must be finite and positive
  if (!isPositiveFinite(output)) return undefined // Quoted output must be finite and positive
  // stats.parameters().fee is a percentage, unlike the API/contract's raw 1e10 value.
  const fee = +feePercent / FEE_PERCENT_SCALE
  if (!Number.isFinite(fee) || fee < 0 || fee >= 1) return undefined
  const price = output / input / (1 - fee)
  return isPositiveFinite(price) ? price : undefined // Quoted price must be finite and positive
}

const createLiquidityCandidates = (
  balances: readonly number[],
  { isCrypto, isMeta, storedRates, APrecise, D, parameters }: PoolLiquidityState,
  { assetTypes }: PoolMetadata,
): { family: LiquidityFamily; curve: LiquidityCurve | undefined }[] => {
  if (!isCrypto) {
    if (storedRates?.length !== balances.length) {
      return []
    }
    // The SDK's metapool rates use [1, base virtual price]. A nonstandard first
    // asset needs stored_rates instead, which that SDK path does not expose.
    if (isMeta && assetTypes?.some(type => type !== STANDARD_ASSET_TYPE)) {
      return []
    }
    const { A } = parameters
    const amplification = APrecise == null ? +A : +APrecise / STABLESWAP_A_PRECISION
    return [{ family: 'stableswap', curve: createStableSwapCurve(balances, storedRates.map(Number), amplification) }]
  }

  const { A, gamma: rawGamma, priceScale } = parameters
  const amplification = +A
  const gamma = Number(rawGamma)
  if (!isPositiveFinite(amplification)) return [] // Amplification must be finite and positive
  if (!isPositiveFinite(gamma)) return [] // Gamma must be finite and positive
  const scales = priceScale?.map(Number)
  if (scales?.length !== balances.length - 1) return []
  const invariant = maybe(D, d => +fromWei(d, CRYPTO_INVARIANT_DECIMALS))

  // flet-curve-demo/src/curve/depth.py: _crypto and fit. API factory types
  // alone cannot distinguish every deployed math variant; fit against get_dy.
  if (balances.length === 2) {
    const [scale] = scales
    return [
      {
        family: 'twocrypto',
        curve: createTwoCryptoCurve(balances, scale, amplification / CRYPTOSWAP_A_PRECISION, gamma, invariant),
      },
      {
        family: 'fxswap',
        curve: createStableSwapCurve(balances, [1, scale], amplification / CRYPTOSWAP_A_PRECISION, invariant),
      },
      {
        family: 'twocrypto-legacy',
        curve: createTwoCryptoCurve(balances, scale, amplification / CRYPTOSWAP_A_PRECISION, gamma, invariant, true),
      },
    ]
  }
  if (balances.length === 3) {
    return [
      {
        family: 'tricrypto',
        curve: createTriCryptoCurve(balances, scales, amplification / CRYPTOSWAP_A_PRECISION, gamma, invariant),
      },
      {
        family: 'tricrypto-legacy',
        curve: createTriCryptoCurve(
          balances,
          scales,
          amplification / LEGACY_TRICRYPTO_A_PRECISION,
          gamma,
          invariant,
          true,
        ),
      },
    ]
  }
  return []
}

/** Returns no profile for unsupported data, solver failures, or a curve that does not match the quote. */
export const processConnectedLiquidity = (
  state: PoolLiquidityState,
  metadata: PoolMetadata,
  quote: PoolLiquidityQuote,
  pair: LiquidityPair,
  options?: LiquidityProfileOptions,
): PoolLiquidityResult | undefined => {
  const { isLending, isLlamma, balances: wrappedBalances, wrappedDecimals } = state
  if (isLending || isLlamma) {
    return undefined
  }
  const balances = wrappedBalances.map(Number)
  if (!isValidPair(pair, balances.length)) return undefined // The pair must contain two distinct pool coin indices
  if (wrappedDecimals.length !== balances.length) {
    return undefined
  }
  const quoted = quotedPrice(state, quote, pair)
  if (quoted == null) return undefined
  const candidates = createLiquidityCandidates(balances, state, metadata)

  const best = minBy(
    candidates.flatMap(({ family, curve }) => {
      if (!curve) return []
      return notFalsy(
        maybe(spotPrice(curve, pair), spot => ({ family, curve, error: Math.abs(spot - quoted) / quoted })),
      )
    }),
    'error',
  )
  if (!best || best.error > MAX_RELATIVE_QUOTE_ERROR) return undefined
  const { curve, family, error } = best
  const profile = liquidityProfile(curve, pair, options)
  if (!profile) return undefined
  // Crypto oracle values are denominated in coin 0; convert to output per input.
  const oraclePrices = [1, ...(state.parameters.priceOracle?.map(Number) ?? [])]
  const oraclePrice = oraclePrices[pair[0]] / oraclePrices[pair[1]]
  return {
    ...profile,
    source: 'rpc',
    family,
    quoteError: error,
    centerPrice: peakPrice(curve, pair),
    oraclePrice: state.isCrypto && isPositiveFinite(oraclePrice) ? oraclePrice : undefined,
  }
}

/** API USD values use the same coin-indexed balances. Missing valuations stay unavailable. */
export const liquidityTokenUsdPrice = (
  { coins, balances, balancesUsd }: Pool,
  coinIndex: number,
  coinAddress: string,
): number | undefined => {
  const { address } = coins.find(({ poolIndex }) => poolIndex === coinIndex) ?? {}
  if (address?.toLowerCase() !== coinAddress.toLowerCase()) return undefined
  const balance = balances[coinIndex]
  const value = balancesUsd[coinIndex]
  const price = value / balance
  return Number.isFinite(price) && price > 0 ? price : undefined
}
