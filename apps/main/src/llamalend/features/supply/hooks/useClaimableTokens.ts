import { sum } from 'lodash'
import { useMemo } from 'react'
import type { Address } from 'viem'
import { useClaimableCrv, useClaimableRewards } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import { hasClaimableRewards } from '@/llamalend/queries/supply/supply-query.helpers'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV } from '@evm-ui/utils'
import { maybe, notFalsy, recordValues } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'

export const useClaimableTokens = <ChainId extends LlamaChainId>({
  params,
  crvAddress,
}: {
  params: UserMarketParams<ChainId>
  crvAddress: Address | undefined
}) => {
  const { chainId } = params

  const {
    data: claimableRewards,
    isLoading: isClaimableRewardsLoading,
    error: claimableRewardsError,
  } = useClaimableRewards(params)
  const { data: claimableCrv, isLoading: isClaimableCrvLoading, error: claimableCrvError } = useClaimableCrv(params)

  const rewardsAddresses = useMemo(() => claimableRewards?.map(r => r.token) ?? [], [claimableRewards])

  const usdRates = useTokenUsdRates({ chainId, tokenAddresses: notFalsy(crvAddress, ...rewardsAddresses) })
  const { isLoading: usdRateLoading, error: usdRateError } = combineQueryState(...recordValues(usdRates))

  const claimableTokens = useMemo(() => {
    const tokens = notFalsy(
      crvAddress &&
        claimableCrv &&
        crvAddress && { amount: claimableCrv, token: crvAddress, symbol: MAINNET_CRV.symbol },
      ...(claimableRewards ?? []),
    )
    return tokens
      .filter(({ amount }) => Number(amount) > 0)
      .map(item => ({
        ...item,
        notional: maybe(usdRates[item.token]?.data, price => Number(item.amount) * price),
        isLoading: usdRates[item.token]?.isLoading,
      }))
  }, [crvAddress, claimableCrv, claimableRewards, usdRates])

  const totalNotionals = useMemo(() => {
    const notionals = notFalsy(...claimableTokens.map(item => item.notional))
    return notionals.length > 0 ? sum(notionals) : undefined
  }, [claimableTokens])

  return {
    claimableCrvError,
    claimableRewardsError,
    hasClaimableCrv: Number(claimableCrv) > 0,
    hasClaimableRewards: hasClaimableRewards(claimableRewards),
    rewardTokenAddresses: rewardsAddresses,
    claimableTokens,
    totalNotionals,
    isClaimablesLoading: [isClaimableCrvLoading, isClaimableRewardsLoading].some(Boolean),
    usdRateLoading,
    usdRateError,
  }
}
