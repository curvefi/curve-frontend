import { noop } from 'lodash'
import { useCallback } from 'react'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  claimValidationSuite,
  claimableRewardsValidationSuite,
  requireGauge,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { fetchClaimableCrv, fetchClaimableRewards } from '../queries/supply/supply-claimable-rewards.query'
import { hasClaimableRewards } from '../queries/supply/supply-query.helpers'

type ClaimMutation = Record<string, never>

type ClaimOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
}

const noFormFieldOptions = { onReset: noop }

const claimCrv = async (market: LlamaMarketTemplate, userAddress: Address | undefined) => {
  const claimableCrv = await fetchClaimableCrv({ marketId: market.id, userAddress }, { staleTime: 0 })
  assert(Number(claimableCrv) > 0, 'No claimable CRV rewards found')
  return (await requireVault(market).vault.claimCrv()) as Hex
}

const claimRewards = async (market: LlamaMarketTemplate, userAddress: Address | undefined) => {
  const claimableRewards = await fetchClaimableRewards({ marketId: market.id, userAddress }, { staleTime: 0 })
  assert(hasClaimableRewards(claimableRewards), 'No claimable rewards found')
  return (await requireGauge(market.id).vault.claimRewards()) as Hex
}

export const useClaimCrvMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  crvTokenAddress,
}: ClaimOptions & {
  crvTokenAddress: Address | undefined
}) => {
  const { mutate, error, isPending } = useLlammaMutation<ClaimMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claimCrv'] as const,
    mutationFn: async (_, { market }) => ({ hash: await claimCrv(market, userAddress) }),
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
  const { mutate, error, isPending } = useLlammaMutation<ClaimMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claimRewards'] as const,
    mutationFn: async (_, { market }) => ({ hash: await claimRewards(market, userAddress) }),
    validationSuite: claimableRewardsValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    mutationTokenAddresses: () => rewardTokenAddresses,
    ...noFormFieldOptions, // no form fields
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}
