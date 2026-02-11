import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { type Address } from 'viem'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { decimal, Decimal } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { useCreateLoanMaxReceive } from '../../../queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '../../../queries/market-max-leverage.query'
import type { CreateLoanForm, CreateLoanFormQueryParams } from '../types'

/**
 * Hook to fetch and set the maximum token values for collateral and debt in a create loan form.
 * It retrieves the user's balance for the collateral token and the maximum borrowable amount,
 * then updates the form with these values.
 *
 * @param collateralToken - The collateral token object containing its address.
 * @param params - The parameters required to fetch max borrowable amounts, including chainId, marketId, and userAddress.
 * @param form - The react-hook-form instance managing the create loan form state.
 */
export function useMaxTokenValues(
  collateralToken: Address | undefined,
  params: CreateLoanFormQueryParams & { userAddress?: Address },
  form: UseFormReturn<CreateLoanForm>,
) {
  const {
    data: userBalance,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useTokenBalance({ ...params, tokenAddress: collateralToken })
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
      updateForm(form, { debt, maxDebt })
      pendingRatioRef.current = null
    } else {
      updateForm(form, { maxDebt })
    }
  }, [form, maxDebt])

  useEffect(() => updateForm(form, { maxDebt }), [form, maxDebt])
  useEffect(() => updateForm(form, { maxCollateral }), [form, maxCollateral])

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      const { debt, maxDebt } = form.getValues()
      updateForm(form, { maxDebt: undefined, range })
      // maxDebt is now reset - when the new value arrives, set debt to the same ratio as before
      pendingRatioRef.current = decimal(debt && maxDebt && BigNumber(debt).div(maxDebt))!
    },
    [form],
  )

  return {
    setRange,
    collateral: {
      data: maxCollateral,
      isLoading: !collateralToken || isLoadingMaxBorrow || isBalanceLoading,
      error: maxBorrowError || balanceError,
    },
    debt: {
      data: maxDebt,
      isLoading: !collateralToken || isLoadingMaxBorrow,
      error: maxBorrowError,
    },
    maxLeverage: {
      data: maxLeverage,
      isLoading: isLoadingMaxLeverage || isLoadingMaxBorrow,
      error: maxLeverageError || maxBorrowError,
    },
  }
}
