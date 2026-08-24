import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useRef } from 'react'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { resetCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import type { CreateLoanMaxReceiveParams } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market'
import { useFormSync, useOnChangeCallback } from '@evm-ui/features/forms'
import type { UseFormReturn } from '@evm-ui/features/forms'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { combineQueries } from '@evm-ui/lib'
import { mapQuery } from '@evm-ui/types/util'
import { decimal, decimalMin } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useCreateLoanMaxReceive } from '../../../queries/create-loan/create-loan-max-receive.query'
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
  const maxBorrow = useCreateLoanMaxReceive(params)
  const maxLeverage = useMarketMaxLeverage(params)

  const { maxDebt } = maxBorrow.data ?? {}
  const pendingRatioRef = useRef<Decimal>(null) // keep this in a ref so it doesn't trigger re-renders, used when maxDebt changes
  const maxCollateral = combineQueries([tokenBalance, maxBorrow], (userBalance, { maxTotalCollateral = userBalance }) =>
    decimalMin(userBalance, maxTotalCollateral),
  )

  useEffect(() => {
    const pendingDebtRatio = pendingRatioRef.current
    if (pendingDebtRatio && maxDebt) {
      const debt = decimal(BigNumber(maxDebt).times(pendingDebtRatio))
      updateForm({ debt, maxDebt }, { automated: true })
      pendingRatioRef.current = null
    } else {
      updateForm({ maxDebt }, { automated: true })
    }
  }, [updateForm, maxDebt])

  useFormSync(form, { maxCollateral: maxCollateral.data })

  // some loan queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetCreateLoanExpectedCollateral(params))

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      const { debt, maxDebt } = getValues()
      updateForm({ maxDebt: undefined, range })
      // maxDebt is now reset - when the new value arrives, set debt to the same ratio as before
      pendingRatioRef.current = decimal(debt && maxDebt && BigNumber(debt).div(maxDebt))!
    },
    [getValues, updateForm],
  )

  return {
    setRange,
    collateral: maxCollateral,
    debt: mapQuery(maxBorrow, ({ maxDebt }) => maxDebt),
    maxLeverage: combineQueries(
      [maxLeverage, maxBorrow],
      (maxTotalLeverage, { maxLeverage: maxBorrowLeverage }) => maxBorrowLeverage ?? maxTotalLeverage,
    ),
  }
}
