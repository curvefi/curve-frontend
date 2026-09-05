import { useMemo } from 'react'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useClaimCrvMutation, useClaimRewardsMutation } from '@/llamalend/mutations/claim.mutation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserMarketParams } from '@evm-ui/lib/model'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { notFalsy } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'
import { CLAIM_TAB_COLUMNS } from '../components/columns'
import { useClaimableTokens } from './useClaimableTokens'

export const useClaimTab = <ChainId extends LlamaChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, crvTokenAddress, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network

  const params = useMemo(
    (): UserMarketParams<ChainId> => ({ chainId, marketId, userAddress }),
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
    rewardTokenAddresses,
  } = useClaimableTokens({ params, crvAddress: crvTokenAddress })

  const tableData = useMemo(
    () => claimableTokens.map(token => ({ ...token, blockchainId: network.blockchainId, isLoading: usdRateLoading })),
    [claimableTokens, network.blockchainId, usdRateLoading],
  )

  const table = useCurveTable({
    columns: CLAIM_TAB_COLUMNS,
    query: q({
      data: tableData,
      isLoading: isClaimablesLoading,
      error: claimableCrvError ?? claimableRewardsError ?? null,
    }),
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
    userAddress,
    table,
    onSubmitCrv,
    onSubmitRewards,
    isCrvPending: isClaimCrvPending,
    isRewardsPending: isClaimRewardsPending,
    errors: notFalsy(usdRateError, claimableCrvError, claimableRewardsError, claimRewardsError, claimCrvError),
  }
}
