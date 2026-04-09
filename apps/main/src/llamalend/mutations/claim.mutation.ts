import { noop } from 'lodash'
import { useCallback } from 'react'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { claimValidationSuite, requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { fetchClaimableCrv, fetchClaimableRewards } from '../queries/supply/supply-claimable-rewards.query'
import { hasClaimableRewards } from '../queries/supply/supply-query.helpers'

type ClaimMutation = Record<string, never>

export type ClaimOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
}

const noFormFieldOptions = { onReset: noop }

export const useClaimMutation = ({ network: _network, network: { chainId }, marketId, userAddress }: ClaimOptions) => {
  const { mutate, error, isPending } = useLlammaMutation<ClaimMutation>({
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

      const crvHash = shouldClaimCrv ? ((await lendMarket.vault.claimCrv()) as Hex) : undefined
      if (!shouldClaimRewards) return { hash: assert(crvHash, 'No claimable rewards found') }

      const rewardsHash = (await lendMarket.vault.claimRewards()) as Hex
      // TODO: allow multiple tx hashes in `TransactionResult`
      return { hash: rewardsHash }
    },
    validationSuite: claimValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    ...noFormFieldOptions, // no form fields
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}
