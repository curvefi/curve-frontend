import { noop } from 'lodash'
import { useCallback } from 'react'
import {
  borrowClaimValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address, Hex } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { useMarketMutation } from './useMarketMutation'

type BorrowClaimMutation = Record<string, never>

type BorrowClaimOptions = {
  marketId: string | undefined
  network: { blockchainId: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
  crvTokenAddress: Address | undefined
}

const noFormFieldOptions = { onReset: noop }

export const useBorrowClaimCrvMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  crvTokenAddress,
}: BorrowClaimOptions) => {
  const { mutate, error, isPending } = useMarketMutation<BorrowClaimMutation>({
    network,
    marketId,
    mutationKey: [{ chainId, marketId, userAddress, name: 'collateralRewards.claimCrv' }] as const,
    mutationFn: async (_, { market }) => ({
      hash: (await requireCollateralRewards(market).collateralRewards.claimCrv()) as Hex,
    }),
    validationSuite: borrowClaimValidationSuite,
    pendingMessage: () => t`Claiming CRV rewards...`,
    successMessage: () => t`Claimed rewards!`,
    mutationTokenAddresses: () => notFalsy(crvTokenAddress),
    ...noFormFieldOptions,
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}
