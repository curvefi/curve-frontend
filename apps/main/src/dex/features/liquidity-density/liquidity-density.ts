import { maxBy, minBy } from 'lodash'
import type { PoolParameters } from '@/dex/queries/pool-parameters.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Pool, PoolMetadata, PoolSnapshot } from '@curvefi/prices-api/pools'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { peakPrice, spotPrice } from '@ui/features/pools/liquidity-density/curve'
import { liquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { createTriCryptoCurve } from '@ui/features/pools/liquidity-density/tricrypto'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'
import type { LiquidityCurve, LiquidityPair, LiquidityProfile } from '@ui/features/pools/liquidity-density/types'
import { decimalDiv, decimalDivToPrecision, decimalEqual, decimalMinus, fromWei } from '@ui/lib/decimal'

// Contract/SDK scales differ by family, even where their numeric values coincide.
const STABLESWAP_A_PRECISION = 100
const CRYPTOSWAP_A_PRECISION = 10_000
const LEGACY_TRICRYPTO_A_PRECISION = 100
const CRYPTO_INVARIANT_DECIMALS = 18
const FEE_PERCENT_SCALE = 100
const STANDARD_ASSET_TYPE = 0
/** Probe one millionth of the reserve and accept at most 1% relative error against its fee-adjusted price. */
const QUOTE_PROBE_DIVISOR = '1000000'
const MAX_RELATIVE_QUOTE_ERROR = 0.01

type LiquidityFamily = 'stableswap' | 'twocrypto' | 'twocrypto-legacy' | 'fxswap' | 'tricrypto' | 'tricrypto-legacy'

export type PoolLiquidityResult = LiquidityProfile & {
  family: LiquidityFamily
  centerPrice?: number
  oraclePrice?: number
  /** Relative difference from a small fee-adjusted onchain quote, when connected. */
  quoteError?: number
}

/** Returns no profile when API data cannot describe the pool or the solver cannot follow the curve. */
export const processApiLiquidity = (
  { balances }: Pool,
  { poolType, metapool, assetTypes }: PoolMetadata,
  snapshots: readonly PoolSnapshot[],
  pair: LiquidityPair,
): PoolLiquidityResult | undefined =>
  poolType !== 'stableswapng' || metapool || !assetTypes?.every(type => type === STANDARD_ASSET_TYPE)
    ? undefined
    : maybe(maxBy(snapshots, 'timestamp')?.a, a =>
        // API balances are already whole tokens. For NG, A() is A_precise / STABLESWAP_A_PRECISION.
        maybe(
          createStableSwapCurve(
            balances,
            balances.map(() => 1), // Standard NG assets need no rate conversion from whole-token balances.
            a,
          ),
          curve =>
            maybe(liquidityProfile(curve, pair), profile => ({
              ...profile,
              family: 'stableswap',
              centerPrice: peakPrice(curve, pair),
            })),
        ),
      )

/** flet-curve-demo/src/ui/pool_detail.py: _quoted_price uses one millionth of the input reserve. */
export const liquidityProbeAmount = (
  { isLending, isLlamma, wrappedDecimals }: PoolTemplate,
  balances: Decimal[],
  inputCoin: number,
) =>
  isLending || isLlamma
    ? undefined // Lending rates are not exposed by getStoredRates; LLAMMA uses a different invariant.
    : maybe(zip(balances, wrappedDecimals)[inputCoin], ([balance, decimals]) =>
        decimalDivToPrecision(balance, QUOTE_PROBE_DIVISOR, decimals),
      )

const quotedPrice = ({ fee }: PoolParameters, inputAmount: Decimal, outputAmount: Decimal) =>
  // A tiny probe may round down to zero output. SDK fees are percentages.
  decimalEqual(outputAmount, '0')
    ? undefined
    : +decimalDiv(
        decimalDiv(outputAmount, inputAmount),
        decimalMinus('1', decimalDiv(fee as Decimal, `${FEE_PERCENT_SCALE}`)),
      )

const createLiquidityCandidates = (
  { isCrypto, isMeta }: Pick<PoolTemplate, 'isCrypto' | 'isMeta'>,
  balances: Decimal[],
  parameters: PoolParameters,
  storedRates: Decimal[] | null,
  D: Decimal | null,
  APrecise: Decimal | null,
  { assetTypes }: PoolMetadata,
): { family: LiquidityFamily; curve: LiquidityCurve | undefined }[] => {
  if (!isCrypto) {
    // The SDK's metapool rates use [1, base virtual price]. A nonstandard first
    // asset needs stored_rates instead, which that SDK path does not expose.
    if (isMeta && assetTypes?.some(type => type !== STANDARD_ASSET_TYPE)) {
      return []
    }
    const { A } = parameters
    const amplification = maybe(APrecise, a => +decimalDiv(a, `${STABLESWAP_A_PRECISION}`)) ?? +A
    return [{ family: 'stableswap', curve: createStableSwapCurve(balances, storedRates!, amplification) }]
  }

  const { A, gamma: rawGamma, priceScale } = parameters
  const amplification = +decimalDiv(A as Decimal, `${CRYPTOSWAP_A_PRECISION}`)
  const gamma = rawGamma ? +rawGamma : 0
  const scales = priceScale as Decimal[] | undefined
  if (!scales || !gamma) return [] // Empty crypto pools may have no gamma or price scales.
  const invariant = maybe(D, d => fromWei(d, CRYPTO_INVARIANT_DECIMALS))

  // flet-curve-demo/src/curve/depth.py: _crypto and fit. API factory types alone cannot distinguish every deployed math variant; fit against get_dy.
  if (balances.length === 2) {
    const [scale] = scales
    return [
      { family: 'twocrypto', curve: createTwoCryptoCurve(balances, scale, amplification, gamma, invariant) },
      { family: 'fxswap', curve: createStableSwapCurve(balances, [1, scale], amplification, invariant) },
      {
        family: 'twocrypto-legacy',
        curve: createTwoCryptoCurve(balances, scale, amplification, gamma, invariant, { legacy: true }),
      },
    ]
  }
  return balances.length === 3
    ? [
        { family: 'tricrypto', curve: createTriCryptoCurve(balances, scales, amplification, gamma, invariant) },
        {
          family: 'tricrypto-legacy',
          curve: createTriCryptoCurve(
            balances,
            scales,
            +decimalDiv(A as Decimal, `${LEGACY_TRICRYPTO_A_PRECISION}`),
            gamma,
            invariant,
            { legacy: true },
          ),
        },
      ]
    : [] // not supported
}

/** Returns no profile for unsupported data, solver failures, or a curve that does not match the quote. */
export const processConnectedLiquidity = (
  { isLending, isLlamma, isCrypto, isMeta }: PoolTemplate,
  poolBalances: Decimal[],
  parameters: PoolParameters,
  storedRates: Decimal[] | null,
  D: Decimal | null,
  APrecise: Decimal | null,
  metadata: PoolMetadata,
  quote: Decimal,
  inputAmount: Decimal,
  pair: LiquidityPair,
): PoolLiquidityResult | undefined =>
  isLending || isLlamma
    ? undefined // Lending rates are unavailable in the SDK; LLAMMA requires its own band-based solver.
    : maybe(quotedPrice(parameters, inputAmount, quote), quoted => {
        const best = minBy(
          notFalsy(
            ...createLiquidityCandidates(
              { isCrypto, isMeta },
              poolBalances,
              parameters,
              storedRates,
              D,
              APrecise,
              metadata,
            ).map(({ family, curve }) =>
              maybe(curve, curve =>
                maybe(spotPrice(curve, pair), spot => ({ family, curve, error: Math.abs(spot - quoted) / quoted })),
              ),
            ),
          ),
          'error',
        )
        return maybe(best, ({ curve, family, error }) =>
          error > MAX_RELATIVE_QUOTE_ERROR
            ? undefined
            : maybe(liquidityProfile(curve, pair), profile => ({
                ...profile,
                family,
                quoteError: error,
                centerPrice: peakPrice(curve, pair),
                // Crypto oracle values are denominated in coin 0; convert to output per input.
                oraclePrice: isCrypto
                  ? maybe(parameters.priceOracle, prices => {
                      const oraclePrices: Decimal[] = ['1', ...(prices as Decimal[])]
                      return +decimalDiv(oraclePrices[pair[0]], oraclePrices[pair[1]])
                    })
                  : undefined,
              })),
        )
      })
