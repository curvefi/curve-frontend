import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useRef } from 'react'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { resetCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { useFormSync, useOnChangeCallback } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { decimal } from '@ui-kit/utils'
import { useCreateLoanMaxReceive } from '../../../queries/create-loan/create-loan-max-receive.query'
import type { CreateLoanForm, CreateLoanFormQueryParams } from '../types'

/**
 * Hook to fetch and set the maximum token values for collateral and debt in a create loan form.
 * It retrieves the user's balance for the collateral token and the maximum borrowable amount,
 * then updates the form with these values.
 */
export function useMaxTokenValues({
  market,
  marketId,
  collateralTokenAddress,
  params,
  form,
}: {
  market: MarketTemplate | undefined
  marketId: string | undefined
  collateralTokenAddress: Address | undefined
  params: CreateLoanFormQueryParams & { userAddress?: Address }
  form: UseFormReturn<CreateLoanForm>
}) {
  const { update: updateForm, getValues } = form
  const {
    data: userBalance,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useTokenBalance({ ...params, tokenAddress: collateralTokenAddress })
  const { data: maxBorrow, error: maxBorrowError, isLoading: isLoadingMaxBorrow } = useCreateLoanMaxReceive(params)
  const {
    data: maxTotalLeverage,
    error: maxLeverageError,
    isLoading: isLoadingMaxLeverage,
  } = useMarketMaxLeverage(params)

  const { maxDebt, maxLeverage: maxBorrowLeverage, maxTotalCollateral } = maxBorrow ?? {}
  const pendingRatioRef = useRef<Decimal>(null) // keep this in a ref so it doesn't trigger re-renders, used when maxDebt changes
  const maxCollateral =
    userBalance && maxTotalCollateral
      ? (`${Math.min(+userBalance, +maxTotalCollateral)}` satisfies Decimal)
      : (userBalance ?? maxTotalCollateral)

  const maxLeverage = maxBorrowLeverage ?? maxTotalLeverage

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

  useFormSync(form, { maxCollateral })

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
    collateral: {
      data: maxCollateral,
      isLoading: !marketId || isLoadingMaxBorrow || isBalanceLoading,
      error: maxBorrowError ?? balanceError,
    },
    debt: { data: maxDebt, isLoading: !marketId || isLoadingMaxBorrow, error: maxBorrowError },
    maxLeverage: {
      data: maxLeverage,
      isLoading: isLoadingMaxLeverage || isLoadingMaxBorrow,
      error: maxLeverageError ?? maxBorrowError,
    },
  }
}
