import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import { completeArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybes } from '@primitives/objects.utils'
import { useFormContext } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { fromWei, toWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

/** Reserve slippage headroom and the execution rounding unit from the entered LP budget. */
const getWithdrawLpBudget = (lpAmount: Decimal, slippage: Decimal, lpTokenDecimals: number): Decimal =>
  fromWei(
    BigNumber.maximum(
      0,
      new BigNumber(toWei(lpAmount, lpTokenDecimals))
        .times(100)
        .dividedToIntegerBy(new BigNumber(100).plus(slippage))
        .minus(1),
    ).toFixed(),
    lpTokenDecimals,
  )

const getBalancedAmountUpdates = (
  lpAmount: Decimal | undefined,
  decimals: (number | undefined)[] | undefined,
  reserves: Decimal[] | undefined,
  supply: Decimal | undefined,
  slippage: Decimal,
  lpTokenDecimals: number,
) =>
  maybes([lpAmount, completeArray(decimals), reserves, supply], (lpAmount, decimals, reserves, supply) => {
    const lpBudget = getWithdrawLpBudget(lpAmount, slippage, lpTokenDecimals)
    const scaledValues = scaleReserves(reserves, decimals, lpBudget, supply)
    return fromEntries(scaledValues.map((amount, index) => [poolAmountField(index), amount]))
  })

export function LiquidityProviderInput({
  balance,
  isDisabled,
  reserves,
  tokens,
  decimals,
  supply,
  lpTokenDecimals,
}: {
  balance: QueryProp<Decimal>
  isDisabled: boolean
  reserves: QueryProp<Decimal[]>
  tokens: QueryProp<PoolToken[]>
  decimals: QueryProp<(number | undefined)[]>
  supply: QueryProp<Decimal>
  lpTokenDecimals: number
}) {
  const { update, formState, watchValues } = useFormContext<WithdrawFormValues>()
  const { errors, touchedFields } = formState
  const error = (touchedFields.lpAmount ? (errors.lpAmount ?? errors.maxLpAmount) : undefined) ?? balance.error
  const { lpAmount, slippage } = watchValues()
  const tokenCount = tokens.data?.length

  const onBalance = useCallback(
    (lpAmount: Decimal | undefined) =>
      update({
        lpAmount,
        ...(getBalancedAmountUpdates(lpAmount, decimals.data, reserves.data, supply.data, slippage, lpTokenDecimals) ??
          getPoolDefaultValues(tokenCount ?? 0)),
      }),
    [update, decimals.data, reserves.data, supply.data, slippage, lpTokenDecimals, tokenCount],
  )

  return (
    <LargeTokenInput
      name="lpAmount"
      label={t`LP amount`}
      balance={q({ data: lpAmount, error: error ?? null, isLoading: false })}
      onBalance={onBalance}
      walletBalance={{ symbol: t`LP Tokens`, balance }}
      maxBalance={{ balance, chips: 'max', onMax: onBalance }}
      disabled={isDisabled || !decimals.data || !reserves.data || !supply.data || !+supply.data}
      message={error?.message ?? t`Entering an LP amount fills balanced outputs. You can then edit the token amounts.`}
      testId="pool-withdraw-lp-input"
    />
  )
}
