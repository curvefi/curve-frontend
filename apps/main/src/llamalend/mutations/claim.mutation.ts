import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { claimValidationSuite, requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { waitFor } from '@ui-kit/utils/time.utils'
import { type Config, waitForTransactionReceipt } from '@wagmi/core'
import { fetchClaimableCrv, fetchClaimableRewards } from '../queries/supply/supply-claimable-rewards.query'

type ClaimMutation = Record<string, never>

export type ClaimOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onClaimed: LlammaMutationOptions<ClaimMutation>['onSuccess'] | undefined
  userAddress: Address | undefined
}

const waitForCrvClaim = async ({
  onClaim,
  config,
  isClaimable,
  timeout = Duration.PollTimeout,
}: {
  onClaim: () => Promise<Hex>
  isClaimable: () => Promise<boolean>
  config: Config
  timeout?: number
}): Promise<Hex | null> => {
  if (!(await isClaimable())) return null
  const hash = await onClaim()
  await waitForTransactionReceipt(config, { hash })
  await waitFor(async () => !(await isClaimable()), { timeout })
  return hash
}

export const useClaimMutation = ({
  network: _network,
  network: { chainId },
  marketId,
  onClaimed,
  userAddress,
}: ClaimOptions) => {
  const config = useConfig()
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<ClaimMutation>({
    network: _network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claim'] as const,
    mutationFn: async (_, { market }) => {
      const lendMarket = requireVault(market)

      const crvHash = await waitForCrvClaim({
        isClaimable: async () => {
          const claimableCrv = await fetchClaimableCrv({ marketId: market.id, userAddress }, { staleTime: 0 })
          return claimableCrv != null && +claimableCrv > 0
        },
        onClaim: async () => (await lendMarket.vault.claimCrv()) as Hex,
        config,
      })

      const claimableRewards = await fetchClaimableRewards({ marketId: market.id, userAddress }, { staleTime: 0 })
      if (claimableRewards.length !== 0) return { hash: crvHash! }
      const rewardsHash = (await lendMarket.vault.claimRewards()) as Hex
      return { hash: crvHash ?? rewardsHash }
    },
    validationSuite: claimValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    onSuccess: onClaimed,
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
