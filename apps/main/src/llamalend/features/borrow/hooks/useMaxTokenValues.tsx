import { useCallback, useEffect, useRef } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { resetCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import type { CreateLoanMaxReceiveParams } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { useFormSync, useOnChangeCallback } from '@ui/features/forms'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimalDivToPrecision, decimalMin, decimalMultiply } from '@ui/lib/decimal'
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
  const { range } = form.values
  const borrowDecimals = getTokens(market)?.borrowToken.decimals
  const pendingDebtRef = useRef<Pick<CreateLoanForm, 'debt' | 'maxDebt'> | null>(null)
  const maxCollateral = combineQueries([tokenBalance, maxBorrow], (userBalance, { maxTotalCollateral = userBalance }) =>
    decimalMin(userBalance, maxTotalCollateral),
  )

  useEffect(() => {
    // Only use the quote for the selected range, including cached quotes with an unchanged cap.
    if (range !== params.range) return
    const pending = pendingDebtRef.current
    if (pending?.debt && pending.maxDebt && +pending.maxDebt > 0 && maxDebt && borrowDecimals != null) {
      const debt = decimalDivToPrecision(decimalMultiply(pending.debt, maxDebt), pending.maxDebt, borrowDecimals)
      updateForm({ debt, maxDebt }, { automated: true })
    } else {
      updateForm({ maxDebt }, { automated: true })
    }
    if (maxDebt) pendingDebtRef.current = null
  }, [updateForm, maxDebt, range, params.range, borrowDecimals])

  useFormSync(form, { maxCollateral: maxCollateral.data })

  // some loan queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetCreateLoanExpectedCollateral(params))

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      const { debt, maxDebt, range: currentRange } = getValues()
      if (range === currentRange) return
      // Retain the original amounts through rapid range changes, without rounding an intermediate ratio.
      if (maxDebt) pendingDebtRef.current = { debt, maxDebt }
      updateForm({ maxDebt: undefined, range })
    },
    [getValues, updateForm],
  )

  return {
    setRange,
    collateral: maxCollateral,
    debt: mapQuery(maxBorrow, ({ maxDebt, router }) => ({ maxDebt, router })),
    maxLeverage: combineQueries(
      [maxLeverage, maxBorrow],
      (maxTotalLeverage, { maxLeverage: maxBorrowLeverage }) => maxBorrowLeverage ?? maxTotalLeverage,
    ),
  }
}
