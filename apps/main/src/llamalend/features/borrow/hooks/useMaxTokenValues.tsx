import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useRef } from 'react'
import type { CreateLoanMaxReceiveParams } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { FormValues } from '@ui/features/forms/useFormValues'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimal, decimalMin } from '@ui/lib/decimal'
import { useCreateLoanMaxReceiveQueries } from '../../../queries/create-loan/create-loan-max-receive.query'
import type { CreateLoanForm } from '../types'

/** Query limits and preserve the debt ratio for range edits. */
export function useMaxTokenValues({
  collateralTokenAddress,
  inputs: { update: updateForm, values, params },
}: {
  collateralTokenAddress: Address | undefined
  inputs: FormValues<CreateLoanForm, CreateLoanMaxReceiveParams>
}) {
  const tokenBalance = useTokenBalance({ ...params, tokenAddress: collateralTokenAddress })
  const maxBorrow = useCreateLoanMaxReceiveQueries(params)
  const maxLeverage = useMarketMaxLeverage(params)

  const { maxDebt } = maxBorrow.data ?? {}
  const pendingRatioRef = useRef<Decimal>(null) // preserve the debt ratio when maxDebt changes
  const maxCollateral = combineQueries([tokenBalance, maxBorrow], (userBalance, { maxTotalCollateral = userBalance }) =>
    decimalMin(userBalance, maxTotalCollateral),
  )

  useEffect(() => {
    const pendingDebtRatio = pendingRatioRef.current
    if (pendingDebtRatio && maxDebt) {
      const debt = decimal(BigNumber(maxDebt).times(pendingDebtRatio))
      updateForm({ debt }, { mode: 'automatic' })
      pendingRatioRef.current = null
    }
  }, [updateForm, maxDebt])

  // set range is not necessarily tied to maxTokenValues. However, it manipulates them, so we expose it here
  const setRange = useCallback(
    (range: number) => {
      updateForm({ range })
      pendingRatioRef.current = decimal(values.debt && maxDebt && BigNumber(values.debt).div(maxDebt)) ?? null
    },
    [values.debt, maxDebt, updateForm],
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
