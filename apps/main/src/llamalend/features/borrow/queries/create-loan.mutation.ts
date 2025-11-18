import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
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
import { Address } from '@ui-kit/utils'
import { waitFor } from '@ui-kit/utils/time.utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { getBalanceQueryKey } from '@wagmi/core/query'
import { fetchBorrowCreateLoanIsApproved } from '../queries/borrow-create-loan-approved.query'
import { borrowExpectedCollateralQueryKey } from '../queries/borrow-expected-collateral.query'
import type { BorrowForm, BorrowFormQuery } from '../types'
import { borrowFormValidationSuite } from './borrow.validation'

type BorrowMutationContext = {
  chainId: IChainId
  poolId: string | undefined
}

type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

const APPROVE_TIMEOUT = { timeout: 2 * 60 * 1000 } // 2 minutes

export type CreateLoanOptions = {
  poolId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onCreated: (hash: Hex, mutation: BorrowMutation & { txHash: Hex }) => void
  reset: () => void
}

const approve = async (
  market: LlamaMarketTemplate,
  { userCollateral, userBorrowed, leverageEnabled }: BorrowMutation,
) =>
  (leverageEnabled
    ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
      ? await market.leverageV2.createLoanApprove(userCollateral, userBorrowed)
      : await market.leverage.createLoanApprove(userCollateral, userBorrowed)
    : await market.createLoanApprove(userCollateral)) as Address[]

const create = async (
  market: LlamaMarketTemplate,
  { debt, userCollateral, userBorrowed, leverageEnabled, range, slippage }: BorrowMutation,
) => {
  if (leverageEnabled && (market instanceof LendMarketTemplate || market.leverageV2.hasLeverage())) {
    const parent = market instanceof LendMarketTemplate ? market.leverage : market.leverageV2
    return (await parent.createLoan(userCollateral, userBorrowed, debt, range, +slippage)) as Address
  }
  console.assert(!+userBorrowed, `userBorrowed not supported in this market`)
  const parent = leverageEnabled && market instanceof MintMarketTemplate ? market.leverage : market
  return (await parent.createLoan(userCollateral, debt, range, +slippage)) as Address
}

export const useCreateLoanMutation = ({ network, poolId, onCreated }: CreateLoanOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const { chainId } = network
  const mutationKey = ['create-loan', { chainId, poolId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: BorrowMutation) => {
        assertValidity(borrowFormValidationSuite, mutation)
        const market = getLlamaMarket(poolId!)

        const params = { ...mutation, chainId, poolId }
        if (!(await fetchBorrowCreateLoanIsApproved(params))) {
          const approvalTxHashes = await approve(market, mutation)
          await Promise.all(approvalTxHashes.map((hash) => waitForTransactionReceipt(config, { hash })))
          notify(t`Approved loan creation`, 'success')
          await waitFor(() => fetchBorrowCreateLoanIsApproved(params), APPROVE_TIMEOUT)
        }

        const hash = await create(market, mutation)
        await waitForTransactionReceipt(config, { hash })
        return hash
      },
      [poolId, chainId, config],
    ),
    onSuccess: async (txHash, mutation) => {
      logSuccess(mutationKey, txHash)
      notify(t`Loan created successfully`, 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getBalanceQueryKey({ address: wallet?.account.address }) }),
        queryClient.invalidateQueries({
          queryKey: borrowExpectedCollateralQueryKey({ chainId, poolId, ...mutation }),
        }),
      ])
      updateUserEventsApi(wallet!, network, getLlamaMarket(poolId!), txHash)
      onCreated(txHash, { ...mutation, txHash })
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, txHash: data, isPending, isSuccess, reset }
}
