import { noop } from 'lodash'
import { useCallback } from 'react'
import { useMarketMutation } from '@/llamalend/mutations/useMarketMutation'
import {
  claimValidationSuite,
  claimableRewardsValidationSuite,
  requireGauge,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'

type ClaimMutation = Record<string, never>

type ClaimOptions = {
  marketId: string | undefined
  network: { blockchainId: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
}

const noFormFieldOptions = { onReset: noop }

export const useClaimCrvMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  crvTokenAddress,
}: ClaimOptions & { crvTokenAddress: Address | undefined }) => {
  const { mutate, error, isPending } = useMarketMutation<ClaimMutation>({
    network,
    marketId,
    mutationKey: [{ chainId, marketId, userAddress, name: 'claimCrv' }] as const,
    mutationFn: async (_, { market }) => ({ hash: (await requireVault(market).vault.claimCrv()) as Hex }),
    validationSuite: claimValidationSuite,
    pendingMessage: () => t`Claiming CRV rewards...`,
    successMessage: () => t`Claimed rewards!`,
    mutationTokenAddresses: () => notFalsy(crvTokenAddress),
    ...noFormFieldOptions, // no form fields
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}

export const useClaimRewardsMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  rewardTokenAddresses,
}: ClaimOptions & { rewardTokenAddresses: Address[] }) => {
  const { mutate, error, isPending } = useMarketMutation<ClaimMutation>({
    network,
    marketId,
    mutationKey: [{ chainId, marketId, userAddress, name: 'claimRewards' }] as const,
    mutationFn: async (_, { market }) => ({ hash: (await requireGauge(market.id).vault.claimRewards()) as Hex }),
    validationSuite: claimableRewardsValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    mutationTokenAddresses: () => rewardTokenAddresses,
    ...noFormFieldOptions, // no form fields
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}
