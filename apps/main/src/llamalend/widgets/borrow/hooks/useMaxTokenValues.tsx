import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { type Address } from 'viem'
import type { BorrowForm, BorrowFormQueryParams } from '@/llamalend/widgets/borrow/borrow.types'
import { useMaxBorrowReceive } from '@/llamalend/widgets/borrow/queries/borrow-max-receive.query'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { setValueOptions } from '../llama.util'

/**
 * Hook to fetch and set the maximum token values for collateral and debt in a borrow form.
 * It retrieves the user's balance for the collateral token and the maximum borrowable amount,
 * then updates the form with these values.
 *
 * @param collateralToken - The collateral token object containing its address.
 * @param params - The parameters required to fetch max borrowable amounts, including chainId, poolId, and userAddress.
 * @param form - The react-hook-form instance managing the borrow form state.
 */
export function useMaxTokenValues(
  collateralToken: { address: Address } | undefined,
  params: BorrowFormQueryParams & { userAddress?: Address },
  form: UseFormReturn<BorrowForm>,
) {
  const {
    data: userBalance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useTokenBalance(params, collateralToken)
  const { data: maxBorrow, isError: isErrorMaxBorrow, isLoading: isLoadingMaxBorrow } = useMaxBorrowReceive(params)

  const maxDebt = maxBorrow?.maxDebt
  const maxCollateral =
    userBalance && maxBorrow?.maxTotalCollateral
      ? Math.min(userBalance, maxBorrow?.maxTotalCollateral)
      : (userBalance ?? maxBorrow?.maxTotalCollateral)

  useEffect(() => form.setValue('maxDebt', maxDebt, setValueOptions), [form, maxDebt])
  useEffect(() => form.setValue('maxCollateral', maxCollateral, setValueOptions), [form, maxCollateral])

  return {
    isCollateralLoading: !collateralToken || isLoadingMaxBorrow || isBalanceLoading,
    isDebtLoading: !collateralToken || isLoadingMaxBorrow,
    isCollateralError: isErrorMaxBorrow || isBalanceError,
    isDebtError: isErrorMaxBorrow,
  }
}
