import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import type { ClaimOptions } from '@/llamalend/mutations/claim.mutation'
import { useClaimMutation } from '@/llamalend/mutations/claim.mutation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserMarketParams } from '@ui-kit/lib/model'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { CLAIM_TAB_COLUMNS } from '../components/columns'
import { useClaimableTokens } from './useClaimableTokens'

export const useClaimTab = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onSuccess?: ClaimOptions['onSuccess']
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

  const { claimableTokens, totalNotionals, isClaimablesLoading, claimablesError, usdRateLoading, usdRateError } =
    useClaimableTokens(params, enabled)

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
    onSubmit,
    isPending: isClaiming,
    isSuccess: isClaimed,
    error: claimError,
    data,
  } = useClaimMutation({ marketId, network, onSuccess, userAddress })

  return {
    params,
    claimablesError: claimablesError ?? null,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    usdRateError: usdRateError ?? null,
    isDisabled: !!claimablesError || claimableTokens.length === 0,
    isLoading: isClaimablesLoading,
    isError: !!claimablesError,
    table,
    onSubmit,
    isClaimed,
    isPending: isClaiming,
    claimError,
    txHash: data?.hash,
  }
}
