import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { type Address } from 'viem'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { decimal, Decimal } from '@ui-kit/utils'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'
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
  const [pendingDebtRatio, setPendingDebtRatio] = useState<Decimal | undefined>()
  const maxCollateral =
    userBalance && maxTotalCollateral
      ? (`${Math.min(+userBalance, +maxTotalCollateral)}` satisfies Decimal)
      : (userBalance ?? maxTotalCollateral)

  const maxLeverage = maxBorrowLeverage ?? maxTotalLeverage

  useEffect(() => {
    if (pendingDebtRatio && maxDebt) {
      const value = decimal(BigNumber(maxDebt).times(pendingDebtRatio))
      form.setValue('debt', value, setValueOptions)
    }
    form.setValue('maxDebt', maxDebt, setValueOptions) // this needs to validate after setting the debt
  }, [form, maxDebt, pendingDebtRatio])

  useEffect(() => form.setValue('maxCollateral', maxCollateral, setValueOptions), [form, maxCollateral])

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      const { debt, maxDebt } = form.getValues()
      form.setValue('maxDebt', undefined, setValueOptions)
      form.setValue('range', range, setValueOptions)
      // maxDebt is now reset - when the new value arrives, set debt to the same ratio as before
      const ratio = decimal(debt && maxDebt && BigNumber(debt).div(maxDebt))
      setPendingDebtRatio(ratio)
    },
    [form, setPendingDebtRatio],
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
