import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useUserPoolBalancesQuery } from '@/dex/queries/user-pool-balances.query'
import { useUserPoolBoostQuery } from '@/dex/queries/user-pool-boost.query'
import { useUserPoolLiquidityUsdQuery } from '@/dex/queries/user-pool-liquidity-usd.query'
import { useUserPoolShareQuery } from '@/dex/queries/user-pool-share.query'
import type { ChainId } from '@/dex/types/main.types'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalPercent, decimalSum } from '@ui/lib/decimal'

export type UseLiquidityDetailsParams = {
  chainId: ChainId
  poolId: string | undefined
  tokens: string[]
  tokenAddresses: string[]
}

export const useLiquidityDetails = ({ chainId, poolId, tokens, tokenAddresses }: UseLiquidityDetailsParams) => {
  const { address: userAddress } = useConnection()
  const { lpTokenBalance, gaugeTokenBalance } = usePoolTokenDepositBalances({ chainId, poolId, userAddress })

  const hasPosition = Number(lpTokenBalance.data) > 0 || Number(gaugeTokenBalance.data) > 0
  const queryParams = { chainId, poolId, userAddress }

  const userBalances = useUserPoolBalancesQuery(queryParams, hasPosition)
  const userLiquidityUsd = useUserPoolLiquidityUsdQuery(queryParams, hasPosition)
  const userShare = useUserPoolShareQuery(queryParams, hasPosition)
  const userBoost = useUserPoolBoostQuery(queryParams, hasPosition)

  const lpTokenTotal = combineQueries([lpTokenBalance, gaugeTokenBalance], decimalSum)
  const stakedPercent = combineQueries([gaugeTokenBalance, lpTokenTotal], decimalPercent)
  const unstakedPercent = combineQueries([lpTokenBalance, lpTokenTotal], decimalPercent)

  const withdrawRows = useMemo(
    () =>
      tokenAddresses.map((address, index) => ({
        address,
        amount: userBalances.data?.[index],
        symbol: tokens[index] ?? '',
      })),
    [tokenAddresses, tokens, userBalances.data],
  )

  return {
    hasPosition,
    marketParticipation: {
      stakedBalance: gaugeTokenBalance,
      stakedPercent,
      unstakedBalance: lpTokenBalance,
      unstakedPercent,
      userLpShare: mapQuery(userShare, ({ lpShare }) => lpShare),
    },
    metrics: { boost: q(userBoost), lpTokenTotal, positionValue: q(userLiquidityUsd) },
    rows: mapQuery(userBalances, () => withdrawRows),
  }
}

export type LiquidityDetailsData = ReturnType<typeof useLiquidityDetails>
