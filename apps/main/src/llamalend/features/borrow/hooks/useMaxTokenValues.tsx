import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { type Address } from 'viem'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { Decimal } from '@ui-kit/utils'
import { useCreateLoanMaxReceive } from '../../../queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '../../../queries/market-max-leverage.query'
import { setValueOptions } from '../react-form.utils'
import type { BorrowForm, BorrowFormQueryParams } from '../types'

/**
 * Hook to fetch and set the maximum token values for collateral and debt in a borrow form.
 * It retrieves the user's balance for the collateral token and the maximum borrowable amount,
 * then updates the form with these values.
 *
 * @param collateralToken - The collateral token object containing its address.
 * @param params - The parameters required to fetch max borrowable amounts, including chainId, marketId, and userAddress.
 * @param form - The react-hook-form instance managing the borrow form state.
 */
export function useMaxTokenValues(
  collateralToken: { address: Address } | undefined,
  params: BorrowFormQueryParams & { userAddress?: Address },
  form: UseFormReturn<BorrowForm>,
) {
  const {
    data: userBalance,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useTokenBalance(params, collateralToken)
  const { data: maxBorrow, error: maxBorrowError, isLoading: isLoadingMaxBorrow } = useCreateLoanMaxReceive(params)
  const {
    data: maxTotalLeverage,
    error: maxLeverageError,
    isLoading: isLoadingMaxLeverage,
  } = useMarketMaxLeverage(params)

  const { maxDebt, maxLeverage: maxBorrowLeverage, maxTotalCollateral } = maxBorrow ?? {}
  const maxCollateral =
    userBalance && maxTotalCollateral
      ? (`${Math.min(+userBalance, +maxTotalCollateral)}` satisfies Decimal)
      : (userBalance ?? maxTotalCollateral)

  const maxLeverage = maxBorrowLeverage ?? maxTotalLeverage

  useEffect(() => form.setValue('maxDebt', maxDebt, setValueOptions), [form, maxDebt])
  useEffect(() => form.setValue('maxCollateral', maxCollateral, setValueOptions), [form, maxCollateral])

  return {
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
