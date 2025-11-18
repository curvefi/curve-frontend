import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import type {
  IChainId as LlamaChainId,
  IChainId,
  INetworkName as LlamaNetworkId,
} from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { useMutation } from '@tanstack/react-query'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { t } from '@ui-kit/lib/i18n'
import { Address, Amount, Decimal } from '@ui-kit/utils'
import { waitFor } from '@ui-kit/utils/time.utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { getBalanceQueryKey } from '@wagmi/core/query'
import type { BorrowForm, BorrowFormQuery } from '../types'
import { borrowFormValidationSuite } from './borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'

type BorrowMutationContext = {
  chainId: IChainId
  marketId: string | undefined
}

type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

const APPROVE_TIMEOUT = { timeout: 2 * 60 * 1000 } // 2 minutes

export type CreateLoanOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onCreated: (hash: Hex, mutation: BorrowMutation & { txHash: Hex }) => void
  reset: () => void
}

const getCreateMethods = (marketId: string, leverageEnabled: boolean) => {
  const market = getLlamaMarket(marketId)
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
    createLoan: async (collateral: Amount, userBorrowed: Amount, debt: Amount, range: number, slippage: Decimal) => {
      if (leverageEnabled && (market instanceof LendMarketTemplate || market.leverageV2.hasLeverage())) {
        const parent = market instanceof LendMarketTemplate ? market.leverage : market.leverageV2
        return (await parent.createLoan(collateral, userBorrowed, debt, range, +slippage)) as Address
      }
      console.assert(!+userBorrowed, `userBorrowed not supported in this market`)
      const parent = leverageEnabled && market instanceof MintMarketTemplate ? market.leverage : market
      return (await parent.createLoan(collateral, debt, range, +slippage)) as Address
    },
  }
}

export const useCreateLoanMutation = ({ network, marketId, onCreated }: CreateLoanOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const mutationKey = ['create-loan', { chainId: network.chainId, marketId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: BorrowMutation) => {
        assertValidity(borrowFormValidationSuite, mutation)
        const { userCollateral, userBorrowed, debt, range, slippage, leverageEnabled } = mutation
        const { createLoanIsApproved, createLoanApprove, createLoan } = getCreateMethods(marketId!, leverageEnabled)

        if (!(await createLoanIsApproved(userCollateral, userBorrowed))) {
          const approvalTxHashes = (await createLoanApprove(userCollateral, userBorrowed)) as Address[]
          await Promise.all(approvalTxHashes.map((hash) => waitForTransactionReceipt(config, { hash })))
          notify(t`Approved loan creation`, 'success')
          await waitFor(() => createLoanIsApproved(userCollateral, userBorrowed), APPROVE_TIMEOUT)
        }

        const loanTxHash = await createLoan(userCollateral, userBorrowed, debt, range, slippage)
        await waitForTransactionReceipt(config, { hash: loanTxHash })
        return loanTxHash
      },
      [marketId, config],
    ),
    onSuccess: async (txHash, mutation) => {
      logSuccess(mutationKey, txHash)
      notify(t`Loan created successfully`, 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getBalanceQueryKey({ address: wallet?.account.address }) }),
        queryClient.invalidateQueries({
          queryKey: createLoanExpectedCollateralQueryKey({ chainId: network?.chainId, marketId, ...mutation }),
        }),
      ])
      updateUserEventsApi(wallet!, network, getLlamaMarket(marketId!), txHash)
      onCreated(txHash, { ...mutation, txHash })
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, txHash: data, isPending, isSuccess, reset }
}
