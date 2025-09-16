import { useCallback } from 'react'
import { useAccount } from 'wagmi'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { useMutation } from '@tanstack/react-query'
import { notify } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { t } from '@ui-kit/lib/i18n'
import { assert } from '@ui-kit/utils'
import { getBalanceQueryKey } from '@wagmi/core/query'
import type { BorrowForm, BorrowFormQuery } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowFormValidationSuite } from './borrow.validation'
import { userBalancesQueryKey } from './user-balances.query'

type BorrowMutationContext = {
  chainId: IChainId
  poolId: string | undefined
}

type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

type CreateLoanOptions = BorrowMutationContext & {
  reset: () => void
}

const getCreateMethods = (poolId: string, leverage: number | undefined) => {
  const market = getLlamaMarket(poolId)
  const parent = leverage
    ? market
    : market instanceof LendMarketTemplate
      ? market.leverage
      : market.leverageV2.hasLeverage()
        ? market.leverageV2
        : market.leverage
  return {
    createLoanIsApproved: parent.createLoanIsApproved.bind(parent),
    createLoanApprove: parent.createLoanApprove.bind(parent),
    createLoan: parent.createLoan.bind(parent),
  }
}

export const useCreateLoanMutation = ({ chainId, poolId }: CreateLoanOptions) => {
  const { address: userAddress } = useAccount()
  const mutationKey = ['create-loan', { chainId, poolId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: BorrowMutation) => {
        assertValidity(borrowFormValidationSuite, mutation)
        const { userCollateral, userBorrowed, debt, leverage, slippage, range } = mutation
        const { createLoanIsApproved, createLoanApprove, createLoan } = getCreateMethods(poolId!, leverage)

        if (!(await createLoanIsApproved(userCollateral, userBorrowed))) {
          const approvalTx = await createLoanApprove(userCollateral, userBorrowed)
          assert(approvalTx, t`Failed to approve loan creation`)
          notify(t`Approved loan creation`, 'success')
        }
        const loanTx = await createLoan(userCollateral, userBorrowed, debt, range, slippage)
        return assert(loanTx, t`Failed to create loan`)
      },
      [poolId],
    ),
    onSuccess: (tx, _mutation) => {
      logSuccess(mutationKey, tx)
      notify(t`Loan created successfully`, 'success')
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: getBalanceQueryKey({ address: userAddress }) }),
        queryClient.invalidateQueries({ queryKey: userBalancesQueryKey({ chainId, poolId, userAddress }) }),
      ])
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, txHash: data, isPending, isSuccess, reset }
}
