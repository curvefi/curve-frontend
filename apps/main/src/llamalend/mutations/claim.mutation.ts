import { useCallback } from 'react'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { claimValidationSuite, requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { fetchClaimableCrv, fetchClaimableRewards } from '../queries/supply/supply-claimable-rewards.query'
import { hasClaimableRewards } from '../queries/supply/supply-query.helpers'

type ClaimMutation = Record<string, never>

export type ClaimOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnTransactionSuccess<ClaimMutation>
  userAddress: Address | undefined
}

export const useClaimMutation = ({
  network: _network,
  network: { chainId },
  marketId,
  onSuccess,
  userAddress,
}: ClaimOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<ClaimMutation>({
    network: _network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claim'] as const,
    mutationFn: async (_, { market }) => {
      const lendMarket = requireVault(market)

      // Fetch rewards on submit to avoid stale data
      const [claimableCrv, claimableRewards] = await Promise.all([
        fetchClaimableCrv({ marketId, userAddress }, { staleTime: 0 }),
        fetchClaimableRewards({ marketId, userAddress }, { staleTime: 0 }),
      ])
      const shouldClaimCrv = Number(claimableCrv) > 0
      const shouldClaimRewards = hasClaimableRewards(claimableRewards)

      if (!shouldClaimCrv && !shouldClaimRewards) {
        throw new Error('No claimable rewards found')
      }

      const crvHash = shouldClaimCrv ? ((await lendMarket.vault.claimCrv()) as Hex) : undefined
      if (!shouldClaimRewards) return { hash: crvHash! }

      const rewardsHash = (await lendMarket.vault.claimRewards()) as Hex
      // TODO: allow multiple tx hashes in `TransactionResult`
      return { hash: rewardsHash }
    },
    validationSuite: claimValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    onSuccess,
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
