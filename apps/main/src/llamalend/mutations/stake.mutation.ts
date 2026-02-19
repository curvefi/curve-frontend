import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
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
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { waitForApproval } from '@ui-kit/utils'
import { formatTokenAmounts } from '../llama.utils'

export type StakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnTransactionSuccess<StakeMutation>
  onReset: () => void
  userAddress: Address | undefined
}

const approveStake = async (market: LendMarketTemplate, { stakeAmount = '0' }: StakeMutation): Promise<Hex[]> =>
  !+stakeAmount ? [] : ((await market.vault.stakeApprove(stakeAmount)) as Hex[])

const stake = async (market: LendMarketTemplate, { stakeAmount }: StakeMutation): Promise<Hex> =>
  (await market.vault.stake(stakeAmount)) as Hex

export const useStakeMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
  onReset,
  userAddress,
}: StakeOptions) => {
  const config = useConfig()

  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<StakeMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'stake'] as const,
    mutationFn: async (variables, { market }) => {
      const lendMarket = requireVault(market)
      await waitForApproval({
        isApproved: async () => await fetchStakeIsApproved({ chainId, marketId, ...variables }, { staleTime: 0 }),
        onApprove: async () => await approveStake(lendMarket, variables),
        message: t`Approved stake`,
        config,
      })

      return { hash: await stake(lendMarket, variables) }
    },
    validationSuite: stakeValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Staking... ${formatTokenAmounts(market, { userBorrowed: mutation.stakeAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Stake successful! ${formatTokenAmounts(market, { userBorrowed: mutation.stakeAmount })}`,
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback(async (form: StakeForm) => mutate(form as StakeMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
