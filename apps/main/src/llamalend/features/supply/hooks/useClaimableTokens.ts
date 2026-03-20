import { sum } from 'lodash'
import { useMemo } from 'react'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useClaimableCrv, useClaimableRewards } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@primitives/objects.utils'
import { UserMarketParams } from '@ui-kit/lib/model'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { CRV_SYMBOL, getCrvAddress } from '@ui-kit/utils/address'

export const useClaimableTokens = <ChainId extends LlamaChainId>(
  params: UserMarketParams<ChainId>,
  market: LlamaMarketTemplate | undefined,
  enabled = true,
) => {
  const { chainId } = params

  const {
    data: claimableRewards,
    isLoading: isClaimableRewardsLoading,
    error: claimableRewardsError,
  } = useClaimableRewards(params, enabled)
  const {
    data: claimableCrv,
    isLoading: isClaimableCrvLoading,
    error: claimableCrvError,
  } = useClaimableCrv(params, enabled)

  const crvAddress = useMemo(() => market?.getLlamalend().constants.ALIASES.crv as Address | undefined, [market])

  const tokenAddresses = useMemo(
    () => notFalsy(crvAddress, ...(claimableRewards?.map((r) => r.token) ?? [])),
    [claimableRewards, crvAddress],
  )
  const {
    data: usdRates,
    isLoading: usdRateLoading,
    error: usdRateError,
  } = useTokenUsdRates({ chainId, tokenAddresses })

  const claimableTokens = useMemo(() => {
    const tokens = notFalsy(
      crvAddress && claimableCrv && crvAddress && { amount: claimableCrv, token: crvAddress, symbol: CRV_SYMBOL },
      ...(claimableRewards ?? []),
    )
    return tokens
      .filter(({ amount }) => Number(amount) > 0)
      .map((item) => ({
        ...item,
        ...(usdRates?.[item.token] != null && { notional: Number(item.amount) * usdRates[item.token] }),
      }))
  }, [crvAddress, claimableCrv, claimableRewards, usdRates, crvAddress])

  const totalNotionals = useMemo(() => {
    const notionals = notFalsy(...claimableTokens.map((item) => item.notional))
    return notionals.length > 0 ? sum(notionals) : undefined
  }, [claimableTokens])

  return {
    claimableTokens,
    totalNotionals,
    isClaimablesLoading: [isClaimableCrvLoading, isClaimableRewardsLoading].some(Boolean),
    claimablesError: [claimableCrvError, claimableRewardsError].find(Boolean) ?? null,
    usdRateLoading,
    usdRateError,
  }
}
