import { noop } from 'lodash'
import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { claimValidationSuite, requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForTransaction } from '@ui-kit/utils'
import { fetchClaimableCrv, fetchClaimableRewards } from '../queries/supply/supply-claimable-rewards.query'

type ClaimMutation = Record<string, never>

export type ClaimOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
}

const noFormFieldOptions = { isDirty: undefined, onReset: noop }

export const useClaimMutation = ({ network: _network, network: { chainId }, marketId, userAddress }: ClaimOptions) => {
  const config = useConfig()
  const { mutate, error, data, isPending, isSuccess } = useLlammaMutation<ClaimMutation>({
    network: _network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claim'] as const,
    mutationFn: async (_, { market }) => {
      const lendMarket = requireVault(market)

      const [crvHash] =
        // wait for CRV to be claimed, before claiming rewards
        (await waitForTransaction({
          isSatisfied: async () => !Number(await fetchClaimableCrv({ marketId, userAddress }, { staleTime: 0 })),
          onExecute: async () => (await lendMarket.vault.claimCrv()) as Hex,
          config,
        })) ?? []

      // Fetch rewards on submit to avoid stale data and keep behavior aligned with CRV claiming.
      const claimableRewards = await fetchClaimableRewards({ marketId: market.id, userAddress }, { staleTime: 0 })
      if (claimableRewards.length === 0) return { hash: crvHash! }
      const rewardsHash = (await lendMarket.vault.claimRewards()) as Hex
      return { hash: crvHash ?? rewardsHash }
    },
    validationSuite: claimValidationSuite,
    pendingMessage: () => t`Claiming rewards...`,
    successMessage: () => t`Claimed rewards!`,
    ...noFormFieldOptions, // no form fields
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess }
}
