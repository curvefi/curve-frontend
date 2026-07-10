import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import {
  StakeForm,
  StakeMutation,
  stakeValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { formatNumber, waitForApproval } from '@ui-kit/utils'

type StakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}
const approveStake = async (market: LendMarketTemplate, { stakeShares = '0' }: StakeMutation): Promise<Hex[]> =>
  +stakeShares ? ((await market.vault.stakeApprove(stakeShares)) as Hex[]) : []

const stake = async (market: LendMarketTemplate, { stakeShares }: StakeMutation): Promise<Hex> =>
  (await market.vault.stake(stakeShares)) as Hex

export const useStakeMutation = ({ network, network: { chainId }, marketId, userAddress, ...props }: StakeOptions) => {
  const config = useConfig()

  const { mutate, error, isPending } = useLlammaMutation<StakeMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'stake'] as const,
    mutationFn: async (variables, { market }) => {
      const lendMarket = requireVault(market)
      await waitForApproval({
        isApproved: async () =>
          await fetchStakeIsApproved({ chainId, marketId, userAddress, ...variables }, { staleTime: 0 }),
        onApprove: async () => await approveStake(lendMarket, variables),
        message: t`Approved stake`,
        config,
      })

      return { hash: await stake(lendMarket, variables) }
    },
    validationSuite: stakeValidationSuite,
    pendingMessage: ({ stakeShares }) => t`Staking... ${formatNumber(stakeShares, 'token.amount')} vault shares`,
    successMessage: ({ stakeShares }) => t`Stake successful! ${formatNumber(stakeShares, 'token.amount')} vault shares`,
    mutationTokenAddresses: (_variables, { market }) => [requireVault(market).addresses.vault] as Address[],
    ...props,
  })

  const onSubmit = useCallback(({ stakeShares = '0' }: StakeForm) => mutate({ stakeShares }), [mutate])

  return { onSubmit, mutate, error, isPending }
}
