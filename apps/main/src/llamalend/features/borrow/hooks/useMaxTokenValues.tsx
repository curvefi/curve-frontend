import { useCallback, useEffect, useRef } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { CreateLoanMaxReceiveParams } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { FormValues } from '@ui/features/forms/useFormValues'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimalDivToPrecision, decimalMultiply } from '@ui/lib/decimal'
import { useCreateLoanMaxReceiveQueries } from '../../../queries/create-loan/create-loan-max-receive.query'
import type { CreateLoanFormValues } from '../types'

/** Query limits and preserve the debt ratio for range edits. */
export function useMaxTokenValues({
  market,
  collateralTokenAddress,
  inputs: { update: updateForm, values, params, resetVersion },
}: {
  market: MarketTemplate | undefined
  collateralTokenAddress: Address | undefined
  inputs: FormValues<CreateLoanFormValues, CreateLoanMaxReceiveParams>
}) {
  const tokenBalance = useTokenBalance({ ...params, tokenAddress: collateralTokenAddress })
  const maxBorrow = useCreateLoanMaxReceiveQueries(params)
  const maxLeverage = useMarketMaxLeverage(params)

  const { maxDebt } = maxBorrow.data ?? {}
  const borrowDecimals = getTokens(market)?.borrowToken.decimals
  const pendingDebtRef = useRef<{ debt: Decimal; maxDebt: Decimal }>(null)

  useEffect(() => {
    pendingDebtRef.current = null
  }, [resetVersion])

  useEffect(
    () => {
      const pending = pendingDebtRef.current
      if (pending && maxDebt && borrowDecimals != null) {
        const debt = decimalDivToPrecision(decimalMultiply(pending.debt, maxDebt), pending.maxDebt, borrowDecimals)
        updateForm({ debt }, { mode: 'automatic' })
        pendingDebtRef.current = null
      }
    },
    // Also run when the cached max for the new range equals the previous max.
    [updateForm, maxDebt, params.range, borrowDecimals],
  )

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      updateForm({ range })
      const debt = values.debt
      // Keep debt at the same share of the max once the new range's max arrives.
      pendingDebtRef.current = range !== params.range && debt && maxDebt && +maxDebt ? { debt, maxDebt } : null
    },
    [values.debt, maxDebt, updateForm, params.range],
  )

  return {
    setRange,
    collateral: tokenBalance,
    debt: mapQuery(maxBorrow, ({ maxDebt, router }) => ({ maxDebt, router })),
    maxLeverage: combineQueries(
      [maxLeverage, maxBorrow],
      (maxTotalLeverage, { maxLeverage: maxBorrowLeverage }) => maxBorrowLeverage ?? maxTotalLeverage,
    ),
  }
}
