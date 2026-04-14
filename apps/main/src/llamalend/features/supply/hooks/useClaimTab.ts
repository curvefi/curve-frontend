import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useClaimCrvMutation, useClaimRewardsMutation } from '@/llamalend/mutations/claim.mutation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@primitives/objects.utils'
import { UserMarketParams } from '@ui-kit/lib/model'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { CLAIM_TAB_COLUMNS } from '../components/columns'
import { useClaimableTokens } from './useClaimableTokens'

export const useClaimTab = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const params = useMemo(
    (): UserMarketParams<ChainId> => ({
      chainId,
      marketId,
      userAddress,
    }),
    [chainId, marketId, userAddress],
  )

  const {
    claimableTokens,
    totalNotionals,
    isClaimablesLoading,
    claimableCrvError,
    claimableRewardsError,
    usdRateLoading,
    usdRateError,
    hasClaimableCrv,
    hasClaimableRewards,
    crvTokenAddress,
    rewardTokenAddresses,
  } = useClaimableTokens(params, market, enabled)

  const tableData = useMemo(
    () => claimableTokens.map((token) => ({ ...token, networkId: network.id, isLoading: usdRateLoading })),
    [claimableTokens, network.id, usdRateLoading],
  )

  const table = useTable({
    columns: CLAIM_TAB_COLUMNS,
    data: tableData,
    ...getTableOptions(tableData),
  })

  const {
    onSubmit: onSubmitCrv,
    isPending: isClaimCrvPending,
    error: claimCrvError,
  } = useClaimCrvMutation({ marketId, network, userAddress, crvTokenAddress })
  const {
    onSubmit: onSubmitRewards,
    isPending: isClaimRewardsPending,
    error: claimRewardsError,
  } = useClaimRewardsMutation({ marketId, network, userAddress, rewardTokenAddresses })

  return {
    params,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    isCrvDisabled: [!hasClaimableCrv, !!claimableCrvError, claimableTokens.length === 0].some(Boolean),
    isRewardsDisabled: [!hasClaimableRewards, !!claimableRewardsError, claimableTokens.length === 0].some(Boolean),
    isLoading: isClaimablesLoading,
    isError: [!!claimableCrvError, !!claimableRewardsError].some(Boolean),
    table,
    onSubmitCrv,
    onSubmitRewards,
    isCrvPending: isClaimCrvPending,
    isRewardsPending: isClaimRewardsPending,
    errors: notFalsy(usdRateError, claimableCrvError, claimableRewardsError, claimRewardsError, claimCrvError),
  }
}
