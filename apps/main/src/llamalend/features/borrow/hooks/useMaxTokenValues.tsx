import { useCallback, useEffect, useRef } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { resetCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import type { CreateLoanMaxReceiveParams } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { useFormSync, useOnChangeCallback } from '@ui/features/forms'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimalDivToPrecision, decimalMultiply } from '@ui/lib/decimal'
import { useCreateLoanMaxReceiveQueries } from '../../../queries/create-loan/create-loan-max-receive.query'
import type { CreateLoanForm } from '../types'

/**
 * Hook to fetch and set the maximum token values for collateral and debt in a create loan form.
 * It retrieves the user's balance for the collateral token and the maximum borrowable amount,
 * then updates the form with these values.
 */
export function useMaxTokenValues({
  market,
  collateralTokenAddress,
  params,
  form,
}: {
  market: MarketTemplate | undefined
  collateralTokenAddress: Address | undefined
  params: CreateLoanMaxReceiveParams & { userAddress?: Address }
  form: UseFormReturn<CreateLoanForm>
}) {
  const { update: updateForm, getValues } = form
  const tokenBalance = useTokenBalance({ ...params, tokenAddress: collateralTokenAddress })
  const maxBorrow = useCreateLoanMaxReceiveQueries(params)
  const maxLeverage = useMarketMaxLeverage(params)

  const { maxDebt } = maxBorrow.data ?? {}
  const borrowDecimals = getTokens(market)?.borrowToken.decimals
  const pendingDebtRef = useRef<{ debt: Decimal; maxDebt: Decimal }>(null) // keep this in a ref so it doesn't trigger re-renders, used when maxDebt changes

  useEffect(
    () => {
      const pending = pendingDebtRef.current
      if (pending && maxDebt && borrowDecimals != null) {
        const debt = decimalDivToPrecision(decimalMultiply(pending.debt, maxDebt), pending.maxDebt, borrowDecimals)
        updateForm({ debt, maxDebt }, { automated: true })
        pendingDebtRef.current = null
      } else {
        updateForm({ maxDebt }, { automated: true })
      }
    },
    // Depends on params.range too, so it still runs when the cached max for the new range equals the old max
    [updateForm, maxDebt, params.range, borrowDecimals],
  )

  useFormSync(form, { maxCollateral: tokenBalance.data })

  // some loan queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetCreateLoanExpectedCollateral(params))

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      const { debt, maxDebt } = getValues()
      updateForm({ range })
      // Keep debt at the same share of the max once the new range's max arrives (none comes back on the current range)
      pendingDebtRef.current = range !== params.range && debt && maxDebt && +maxDebt ? { debt, maxDebt } : null
    },
    [getValues, updateForm, params.range],
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
