import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchCloseIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import type { CloseLoanParams } from '@/llamalend/queries/validation/manage-loan.types'
import { closeLoanValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type ClosePositionOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: () => void
  onReset?: () => void
  userAddress: Address | undefined
}

export type CloseLoanMutation = {
  slippage: Decimal
}

/**
 * Hook for closing a market position by self liquidating the user's position
 * @param params - The user market params to close the position for
 * @returns Mutation object for closing the position
 */
export const useClosePositionMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
  onReset,
  userAddress,
}: ClosePositionOptions) => {
  const config = useConfig()
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<CloseLoanMutation>({
    network,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'close-position'] as const,
    marketId,
    mutationFn: async ({ slippage }, { market }) => {
      await waitForApproval({
        isApproved: async () => await fetchCloseIsApproved({ marketId, chainId, userAddress }, { staleTime: 0 }),
        onApprove: async () => (await market.selfLiquidateApprove()) as Hex[],
        message: t`Approved closing position`,
        config,
      })
      return { hash: (await market.selfLiquidate(Number(slippage))) as Hex }
    },
    pendingMessage: () => t`Closing position...`,
    successMessage: () => t`Position closed successfully!`,
    onSuccess,
    onReset,
    validationSuite: closeLoanValidationSuite,
  })

  const onSubmit = useCallback(async ({ slippage }: CloseLoanParams) => mutate({ slippage: slippage! }), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
