import { useCallback } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { userBalancesQueryKey } from '@/llamalend/queries/user-balances.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { TAmount } from '@curvefi/llamalend-api/src/interfaces'
import { useMutation } from '@tanstack/react-query'
import { notify } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { t } from '@ui-kit/lib/i18n'
import { Address, fromPrecise, stringNumber } from '@ui-kit/utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { getBalanceQueryKey } from '@wagmi/core/query'
import { borrowExpectedCollateralQueryKey } from '../queries/borrow-expected-collateral.query'
import type { BorrowForm, BorrowFormQuery } from '../types'
import { borrowFormValidationSuite } from './borrow.validation'

type BorrowMutationContext = {
  chainId: IChainId
  poolId: string | undefined
}

type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

type CreateLoanOptions = BorrowMutationContext & {
  reset: () => void
}

const getCreateMethods = (poolId: string, leverageEnabled: boolean) => {
  const market = getLlamaMarket(poolId)
  const parent = leverageEnabled
    ? market instanceof LendMarketTemplate
      ? market.leverage
      : market.leverageV2.hasLeverage()
        ? market.leverageV2
        : market.leverage
    : market
  return {
    createLoanIsApproved: parent.createLoanIsApproved.bind(parent),
    createLoanApprove: parent.createLoanApprove.bind(parent),
    createLoan: (userCollateral: TAmount, userBorrowed: TAmount, debt: TAmount, range: number, slippage: number) =>
      // userBorrowed is only needed for leverageV2
      parent === (market as MintMarketTemplate).leverageV2
        ? parent.createLoan(userCollateral, userBorrowed, debt, range, slippage)
        : (parent as LendMarketTemplate['leverage']).createLoan(userCollateral, debt, range, slippage),
  }
}

export const useCreateLoanMutation = ({ chainId, poolId }: CreateLoanOptions) => {
  const config = useConfig()
  const { address: userAddress } = useAccount()
  const mutationKey = ['create-loan', { chainId, poolId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: BorrowMutation) => {
        assertValidity(borrowFormValidationSuite, mutation)
        const { userCollateral, userBorrowed, debt, leverageEnabled, slippage, range } = mutation
        const [collateral, borrowed, userDebt] = [userCollateral, userBorrowed, debt].map(stringNumber)
        const { createLoanIsApproved, createLoanApprove, createLoan } = getCreateMethods(poolId!, leverageEnabled)

        if (!(await createLoanIsApproved(collateral, borrowed))) {
          const approvalTxHashes = (await createLoanApprove(collateral, borrowed)) as Address[]
          await Promise.all(approvalTxHashes.map((hash) => waitForTransactionReceipt(config, { hash })))
          notify(t`Approved loan creation`, 'success')
        }

        const loanTxHash = (await createLoan(collateral, borrowed, userDebt, range, fromPrecise(slippage))) as Address
        await waitForTransactionReceipt(config, { hash: loanTxHash })
        return loanTxHash
      },
      [poolId, config],
    ),
    onSuccess: (tx, mutation) => {
      logSuccess(mutationKey, tx)
      notify(t`Loan created successfully`, 'success')
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: getBalanceQueryKey({ address: userAddress }) }),
        queryClient.invalidateQueries({ queryKey: userBalancesQueryKey({ chainId, poolId, userAddress }) }),
        queryClient.invalidateQueries({ queryKey: borrowExpectedCollateralQueryKey({ chainId, poolId, ...mutation }) }),
      ])
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, txHash: data, isPending, isSuccess, reset }
}
