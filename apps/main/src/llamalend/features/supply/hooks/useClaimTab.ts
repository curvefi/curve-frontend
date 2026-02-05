import { sum } from 'lodash'
import { useMemo } from 'react'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
// import type { ClaimOptions } from '@/llamalend/mutations/claim.mutation'
import { useClaimableCrv, useClaimableRewards } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { combineQueryState } from '@ui-kit/lib'
import { UserMarketParams } from '@ui-kit/lib/model'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { CRV } from '@ui-kit/utils/address'
import { ClaimableToken, getClaimTabColumns } from '../components/columns'

export const useClaimTab = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  // onClaimed,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  // onClaimed?: ClaimOptions['onClaimed']
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

  const claimableRewards = useClaimableRewards(params, enabled)
  const claimableCrv = useClaimableCrv(params, enabled)
  const { loading: isClaimablesLoading, error: claimablesError } = combineQueryState(claimableCrv, claimableRewards)

  const tokenAddresses = useMemo(
    () => [CRV.address, ...(claimableRewards.data?.map((r) => r.token) ?? [])],
    [claimableRewards.data],
  )
  const {
    data: usdRates,
    isLoading: usdRateLoading,
    error: usdRateError,
  } = useTokenUsdRates({ chainId, tokenAddresses })

  const claimableTokens = useMemo(() => {
    const tokens = [
      ...(claimableCrv.data
        ? [{ amount: claimableCrv.data, token: CRV.address as Address, symbol: CRV.symbol as string }]
        : []),
      ...(claimableRewards.data ?? []),
    ]
    return tokens.map((item) => {
      const usdRate = usdRates?.[item.token]
      return {
        ...item,
        notional: item.amount && usdRate != null ? Number(item.amount) * usdRate : undefined,
      }
    })
  }, [claimableCrv.data, claimableRewards.data, usdRates])

  const totalNotionals = useMemo(() => {
    const notionals = notFalsy(...claimableTokens.map((item) => item.notional))
    return notionals.length > 0 ? sum(notionals) : undefined
  }, [claimableTokens])

  const columns = useMemo(() => getClaimTabColumns(network.id, usdRateLoading), [network.id, usdRateLoading])

  const table = useTable<ClaimableToken>({
    columns,
    data: claimableTokens,
    ...getTableOptions(claimableTokens),
  })

  // const {
  //   onSubmit: submitClaim,
  //   isPending: isClaiming,
  //   isSuccess: isClaimed,
  //   error: claimError,
  //   data,
  // } = useClaimMutation({
  //   marketId,
  //   network,
  //   onClaimed,
  //   userAddress,
  // })

  const onSubmit = () => {
    // if (!claimType) return
    // submitClaim({ claimType })
  }

  return {
    params,
    claimablesError,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    usdRateError,
    isError: !!usdRateError || !!claimablesError,
    isLoading: isClaimablesLoading,
    table,
    // isPending: isClaiming,
    // TODO: remove
    isPending: false,
    onSubmit,
    isDisabled: !!claimableRewards.error || !!claimableCrv.error,
    // isClaimed,
    // txHash: data?.hash,
  }
}
