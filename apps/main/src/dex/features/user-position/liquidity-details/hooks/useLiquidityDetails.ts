import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useUserPoolBalancesQuery } from '@/dex/queries/user-pool-balances.query'
import { useUserPoolBoostQuery } from '@/dex/queries/user-pool-boost.query'
import { useUserPoolLiquidityUsdQuery } from '@/dex/queries/user-pool-liquidity-usd.query'
import { useUserPoolShareQuery } from '@/dex/queries/user-pool-share.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui-kit/lib'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalDiv, decimalGreaterThan, decimalMultiply, decimalSum } from '@ui-kit/utils'

export type UseLiquidityDetailsParams = {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string | undefined
}

const calculateShare = (part: Decimal, total: Decimal) =>
  decimalGreaterThan(total, '0') ? decimalMultiply(decimalDiv(part, total), '100') : undefined

export const useLiquidityDetails = ({ chainId, poolDataCacheOrApi, poolId }: UseLiquidityDetailsParams) => {
  const { address: userAddress } = useConnection()
  const {
    lpTokenBalance,
    gaugeTokenBalance,
    isLoading: isLoadingTokenBalances,
  } = usePoolTokenDepositBalances({ chainId, poolId, userAddress })

  const hasPosition = Number(lpTokenBalance) > 0 || Number(gaugeTokenBalance) > 0
  const queryParams = { chainId, poolId, userAddress }

  const userBalances = useUserPoolBalancesQuery(queryParams, hasPosition)
  const userLiquidityUsd = useUserPoolLiquidityUsdQuery(queryParams, hasPosition)
  const userShare = useUserPoolShareQuery(queryParams, hasPosition)
  const userBoost = useUserPoolBoostQuery(queryParams, hasPosition)

  const tokenBalanceQueryState = { isLoading: isLoadingTokenBalances, error: null } // usePoolTokenDepositBalances has no proper error yet
  const stakedBalance = q({ data: gaugeTokenBalance, ...tokenBalanceQueryState })
  const unstakedBalance = q({ data: lpTokenBalance, ...tokenBalanceQueryState })
  const lpTokenTotal = combineQueries([unstakedBalance, stakedBalance], decimalSum)
  const stakedPercent = combineQueries([stakedBalance, lpTokenTotal], calculateShare)
  const unstakedPercent = combineQueries([unstakedBalance, lpTokenTotal], calculateShare)

  const withdrawRows = useMemo(
    () =>
      poolDataCacheOrApi.tokenAddresses.map((address, index) => ({
        address,
        amount: userBalances.data?.[index],
        symbol: poolDataCacheOrApi.tokens[index] ?? '',
      })),
    [poolDataCacheOrApi.tokenAddresses, poolDataCacheOrApi.tokens, userBalances.data],
  )

  return {
    hasPosition,
    marketParticipation: {
      stakedBalance,
      stakedPercent,
      unstakedBalance,
      unstakedPercent,
      userLpShare: mapQuery(userShare, ({ lpShare }) => lpShare),
    },
    metrics: {
      boost: q(userBoost),
      lpTokenTotal,
      positionValue: q(userLiquidityUsd),
    },
    withdraw: {
      rows: mapQuery(userBalances, () => withdrawRows),
    },
  }
}

export type LiquidityDetailsData = ReturnType<typeof useLiquidityDetails>
