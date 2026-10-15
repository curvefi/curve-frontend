import { useConnection } from 'wagmi'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { getToken, useTokens } from '@/dex/queries/tokens.query'
import { useUserPoolBalancesQuery } from '@/dex/queries/user-pool-balances.query'
import { useUserPoolBoostQuery } from '@/dex/queries/user-pool-boost.query'
import { useUserPoolLiquidityUsdQuery } from '@/dex/queries/user-pool-liquidity-usd.query'
import { useUserPoolShareQuery } from '@/dex/queries/user-pool-share.query'
import type { ChainId } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'
import { zip } from '@primitives/array.utils'
import { Chain } from '@primitives/network.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { LiquidityDetailsData } from '@ui/features/pools/liquidity-details/types'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, toQuery } from '@ui/features/queries/util'
import { decimalPercent, decimalSum } from '@ui/lib/decimal'

export type UseLiquidityDetailsParams = {
  chainId: ChainId
  poolAddress: Address | Nullish
  tokenAddresses: Address[] | Nullish
}

export const useLiquidityDetails = ({
  chainId,
  poolAddress,
  tokenAddresses,
}: UseLiquidityDetailsParams): LiquidityDetailsData => {
  const { address: userAddress } = useConnection()
  const tokens = useTokens({ chainId })
  const { lpTokenBalance, gaugeTokenBalance } = usePoolTokenDepositBalances({ chainId, poolAddress, userAddress })

  const hasPosition = Number(lpTokenBalance.data) > 0 || Number(gaugeTokenBalance.data) > 0
  const queryParams = { chainId, poolAddress, userAddress }

  // There's a ticket to support boost values on sidechains; for now we hide it explicitly instead of showing N/A.
  const showBoost = chainId === Number(Chain.Ethereum)

  const userBalances = useUserPoolBalancesQuery(queryParams, hasPosition)
  const userLiquidityUsd = useUserPoolLiquidityUsdQuery(queryParams, hasPosition)
  const userShare = useUserPoolShareQuery(queryParams, hasPosition)
  const userBoost = useUserPoolBoostQuery(queryParams, hasPosition && showBoost)

  const lpTokenTotal = combineQueries([lpTokenBalance, gaugeTokenBalance], decimalSum)
  const stakedPercent = combineQueries([gaugeTokenBalance, lpTokenTotal], decimalPercent)
  const unstakedPercent = combineQueries([lpTokenBalance, lpTokenTotal], decimalPercent)

  return {
    hasPosition,
    marketParticipation: {
      stakedBalance: gaugeTokenBalance,
      stakedPercent,
      unstakedBalance: lpTokenBalance,
      unstakedPercent,
      userLpShare: mapQuery(userShare, ({ lpShare }) => lpShare),
    },
    metrics: { ...(showBoost && { boost: q(userBoost) }), lpTokenTotal, positionValue: q(userLiquidityUsd) },
    rows: mapQuery(userBalances, balances =>
      zip(tokenAddresses ?? [], balances).map(([address, amount]) => ({
        address,
        symbol: mapQuery(tokens, tokens => getToken(tokens, address)?.symbol),
        amount: toQuery(amount, userBalances),
      })),
    ),
  }
}
