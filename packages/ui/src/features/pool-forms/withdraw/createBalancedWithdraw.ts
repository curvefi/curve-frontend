import { completeArray, isComplete, zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalDiv, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { getPoolDefaultValues, poolAmountField } from '../pool-form.utils'
import type { PoolToken } from '../PoolTokenInput'
import { getBalancedWithdrawAmounts, getBalancedWithdrawLp } from './balanced-withdraw.utils'
import type { AdvancedWithdrawFormValues } from './withdraw-form.utils'

/** Derive LP value and balanced withdrawal updates while preserving query state for the USD value. */
export const createBalancedWithdraw = ({
  values,
  tokens,
  tokenCount,
  reserves,
  supply,
}: {
  values: Pick<AdvancedWithdrawFormValues, 'lpAmount' | 'decimals'>
  tokens: QueryProp<PoolToken>[] | undefined
  tokenCount: number | undefined
  reserves: QueryProp<Decimal[]>
  supply: QueryProp<Decimal>
}) => {
  const precision = completeArray(values.decimals)
  const { data: balances } = reserves
  const { data: totalSupply } = supply
  const amountsUsd = combineQueries([reserves, ...(tokens ?? [])], (balances, ...tokens) =>
    balances.length === tokens.length
      ? zip(balances, tokens).map(([amount, { usdRate }]) => maybe(usdRate, rate => decimalMultiply(amount, rate)))
      : undefined,
  )
  const lpAmountUsd = combineQueries([supply, amountsUsd], (totalSupply, amountsUsd) =>
    +totalSupply > 0 && isComplete(amountsUsd)
      ? maybes([values.lpAmount, decimalDiv(decimalSum(...amountsUsd), totalSupply)], decimalMultiply)
      : undefined,
  )
  const canBalance = totalSupply && balances && precision && !!+totalSupply

  /** Build proportional token updates from an LP amount, clearing them when inputs are unavailable. */
  const getUpdatesFromLpAmount = (lpAmount: Decimal | undefined) => ({
    lpAmount,
    ...(lpAmount && canBalance
      ? fromEntries(
          getBalancedWithdrawAmounts(lpAmount, balances, totalSupply, precision).map((amount, index) => [
            poolAmountField(index),
            amount,
          ]),
        )
      : maybe(tokenCount, getPoolDefaultValues)),
  })

  /** Convert an edited token amount to LP, then reuse getUpdatesFromLpAmount for proportional token updates. */
  const getUpdatesFromTokenAmount = (index: number, amount: Decimal | undefined) =>
    canBalance
      ? getUpdatesFromLpAmount(
          maybe(amount, amount =>
            +balances[index]
              ? getBalancedWithdrawLp(amount, precision[index], balances[index], totalSupply)
              : undefined,
          ),
        )
      : undefined

  return { canBalance, lpAmountUsd, getUpdatesFromLpAmount, getUpdatesFromTokenAmount }
}
