import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { type Address } from 'viem'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { setValueOptions } from '../react-form.utils'
import type { BorrowForm, BorrowFormQueryParams } from '../types'

/**
 * Custom hook that fetches and manages token balances for both borrow and collateral tokens.
 * Automatically updates the form with the retrieved balance values.
 *
 * @param borrowToken - The borrow token object containing its address
 * @param collateralToken - The collateral token object containing its address
 * @param params - Query parameters including chainId, poolId, and optional userAddress for fetching token balances.
 * @param form - The react-hook-form instance managing the borrow form state.
 */
export function useTokenBalances(
  borrowToken: { address: Address } | undefined,
  collateralToken: { address: Address } | undefined,
  params: BorrowFormQueryParams & { userAddress?: Address },
  form: UseFormReturn<BorrowForm>,
) {
  const {
    data: borrowBalance,
    isError: isBorrowBalanceError,
    isLoading: isBorrowBalanceLoading,
  } = useTokenBalance(params, borrowToken)

  const {
    data: collateralBalance,
    isError: isCollateralBalanceError,
    isLoading: isCollateralBalanceLoading,
  } = useTokenBalance(params, collateralToken)

  useEffect(() => form.setValue('borrowBalance', borrowBalance, setValueOptions), [form, borrowBalance])
  useEffect(() => form.setValue('collateralBalance', collateralBalance, setValueOptions), [form, collateralBalance])

  return {
    borrowBalance,
    collateralBalance,
    isBorrowBalanceError,
    isBorrowBalanceLoading,
    isCollateralBalanceError,
    isCollateralBalanceLoading,
  }
}
