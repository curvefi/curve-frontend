import { BigNumber } from 'bignumber.js'
import { test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { NoRetryError } from '@ui/features/queries/factory'
import { fromWei, toWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'

export type OneCoinWithdrawQuoteQuery = {
  amount: Decimal
  maxLpAmount: Decimal
  decimals: number
  index: number
  slippage: Decimal
}

export const validateOneCoinWithdrawQuote = ({
  amount,
  maxLpAmount,
  decimals,
  slippage,
}: FieldsOf<OneCoinWithdrawQuoteQuery>) => {
  validateSlippage({ slippage })
  test('decimals', 'Token precision is unavailable', () => {
    enforce(decimals).isNumber().condition(Number.isInteger).gte(0)
  })
  test('amount', 'Enter a valid token amount', () => {
    enforce(amount)
      .isDecimal({ decimal_digits: `0,${decimals ?? 0}` })
      .gt(0)
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      .gt(0)
  })
}

/** Refine four contract quotes per round; accept at most slippage / 10 of excess output. */
export const estimateOneCoinWithdraw = async ({
  amount,
  maxLpAmount,
  decimals,
  slippage,
  quote,
  signal,
}: Omit<OneCoinWithdrawQuoteQuery, 'index'> & {
  quote: (amounts: bigint[]) => Promise<bigint[]>
  signal: AbortSignal
}) => {
  const started = performance.now()
  const log = (step: string, details: object) => {
    // eslint-disable-next-line no-console -- Temporary diagnostics for the one-coin quoting trial.
    console.log('[oneCoinWithdrawQuote]', step, {
      id: started,
      elapsedMs: Math.round(performance.now() - started),
      ...details,
    })
  }
  const target = BigInt(toWei(amount, decimals))
  const maximum = BigInt(toWei(maxLpAmount, LP_TOKEN_DECIMALS))
  const tolerance = BigInt(
    BigNumber.max(1, new BigNumber(target.toString()).times(slippage).div(1000))
      .integerValue(BigNumber.ROUND_FLOOR)
      .toFixed(),
  )
  log('start', { amount, maxLpAmount, decimals, slippage, tolerance: fromWei(tolerance, decimals) })
  const points = new Map<bigint, bigint>([[0n, 0n]])
  let candidates = [maximum / 4n, maximum / 2n, (maximum * 3n) / 4n, maximum]
  try {
    for (let round = 1; round <= 8; round++) {
      signal.throwIfAborted()
      const burns = [...new Set(candidates)].filter(burn => burn > 0n && !points.has(burn))
      if (!burns.length) break
      log('candidates', { round, lpAmounts: burns.map(burn => fromWei(burn, LP_TOKEN_DECIMALS)) })
      const outputs = await quote(burns)
      signal.throwIfAborted()
      log('outputs', {
        round,
        quotes: burns.map((burn, index) => ({
          lpAmount: fromWei(burn, LP_TOKEN_DECIMALS),
          amount: fromWei(outputs[index], decimals),
        })),
      })
      burns.forEach((burn, index) => points.set(burn, outputs[index]))
      const sorted = [...points].toSorted(([a], [b]) => (a < b ? -1 : 1))
      const upperIndex = sorted.findIndex(([, output]) => output >= target)
      if (upperIndex === -1) throw new NoRetryError(t`Amount exceeds the maximum withdrawal`)
      const [upper, output] = sorted[upperIndex]
      const [lower, lowerOutput] = sorted[upperIndex - 1]
      const errorPercent = new BigNumber((output - target).toString()).div(target.toString()).times(100).toFixed()
      log('bounds', {
        round,
        lower: { lpAmount: fromWei(lower, LP_TOKEN_DECIMALS), amount: fromWei(lowerOutput, decimals) },
        upper: { lpAmount: fromWei(upper, LP_TOKEN_DECIMALS), amount: fromWei(output, decimals) },
        errorPercent,
      })
      if (output - target <= tolerance) {
        const result = { lpAmount: fromWei(upper, LP_TOKEN_DECIMALS), amount: fromWei(output, decimals) }
        log('converged', { rounds: round, calls: points.size - 1, errorPercent, ...result })
        return result
      }
      const width = upper - lower
      candidates = [
        lower + width / 4n,
        lower + width / 2n,
        lower + (width * 3n) / 4n,
        lower + ((target - lowerOutput) * width) / (output - lowerOutput) + 1n,
      ].filter(burn => burn > lower && burn < upper)
    }
    throw new NoRetryError(t`Could not estimate this withdrawal within the requested precision. Try another amount.`)
  } catch (error: unknown) {
    log(signal.aborted ? 'cancelled' : 'failed', { completedCalls: points.size - 1, error })
    throw error
  }
}
