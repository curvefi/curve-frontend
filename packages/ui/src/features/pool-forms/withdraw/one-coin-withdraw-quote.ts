import { BigNumber } from 'bignumber.js'
import { sortBy } from 'lodash'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { range } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { NoRetryError } from '@ui/features/queries/factory'
import { fromWei, toWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export type OneCoinWithdrawQuoteQuery = {
  amount: Decimal
  supply: Decimal
  decimals: number[]
  index: number
  slippage: Decimal
}

const QUOTES_PER_ROUND = 4
const MAX_ROUNDS = 8
const QUOTE_TOLERANCE_FACTOR = 0.1

/** Search the pool's LP supply independently of the user's balance. */
export const estimateOneCoinWithdraw = async ({
  amount,
  supply,
  decimals,
  slippage,
  quote,
}: Pick<OneCoinWithdrawQuoteQuery, 'amount' | 'supply' | 'slippage'> & {
  decimals: number
  quote: (amounts: bigint[]) => Promise<(bigint | null)[]>
}) => {
  const target = BigInt(toWei(amount, decimals))
  const maximum = BigInt(toWei(supply, LP_TOKEN_DECIMALS))
  const tolerance = BigInt(
    BigNumber.max(1, new BigNumber(target.toString()).times(slippage).times(QUOTE_TOLERANCE_FACTOR).div(100))
      .integerValue(BigNumber.ROUND_FLOOR)
      .toFixed(),
  )
  const fractions = range(QUOTES_PER_ROUND).map(index => BigInt(index + 1))
  const partitions = BigInt(QUOTES_PER_ROUND)

  const outputsByBurn = new Map<bigint, bigint | null>([[0n, 0n]]) // Burning zero LP returns zero tokens.
  let candidates = fractions.map(part => (maximum * part) / partitions)
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const burns = [...new Set(candidates)].filter(burn => burn > 0n && !outputsByBurn.has(burn))
    if (!burns.length) break
    zip(burns, await quote(burns)).forEach(([burn, output]) => outputsByBurn.set(burn, output))
    const sorted = sortBy([...outputsByBurn], ([burn]) => burn)
    const valid = sorted.filter((entry): entry is [bigint, bigint] => entry[1] != null)
    const upperIndex = valid.findIndex(([, output]) => output >= target)
    const [lower, lowerOutput] = valid[upperIndex === -1 ? valid.length - 1 : upperIndex - 1]
    // If larger burns reverted, subdivide below the next revert until a usable upper quote is found.
    const upperQuote = upperIndex === -1 ? sorted.find(([burn]) => burn > lower) : valid[upperIndex]
    if (!upperQuote) throw new NoRetryError(t`Withdrawal quote is unavailable. Try another amount.`)
    const [upper, output] = upperQuote
    if (output != null && output - target <= tolerance) {
      return { lpAmount: fromWei(upper, LP_TOKEN_DECIMALS), amount: fromWei(output, decimals) }
    }
    const width = upper - lower
    candidates = fractions
      .map(part =>
        part === partitions && output != null
          ? lower + ((target - lowerOutput) * width) / (output - lowerOutput) + 1n // Round interpolation up.
          : lower + (width * part) / partitions,
      )
      .filter(burn => burn > lower && burn < upper)
  }
  throw new NoRetryError(t`Could not estimate this withdrawal within the required precision. Try another amount.`)
}
