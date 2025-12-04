import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'

export function useDebtToken(params: MarketParams): ClosePositionProps['debtToken'] {
  const { address: userAddress } = useWagmiConnection()
  const { data: userState } = useUserState({ ...params, userAddress })

  const { debt } = userState ?? {}

  const market = getLlamaMarket(params.marketId)
  const { borrowToken } = (market && getTokens(market)) || {}

  if (!borrowToken || !borrowToken.address || debt == null) {
    return undefined
  }

  return {
    symbol: borrowToken.symbol,
    address: borrowToken.address,
    amount: debt,
  }
}
