import { useConnection } from 'wagmi'
import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'

export function useDebtToken(params: MarketParams): ClosePositionProps['debtToken'] {
  const { address: userAddress } = useConnection()
  const { data: userState } = useUserState({ ...params, userAddress })

  const { debt } = userState ?? {}

  const market = getLlamaMarket(params.marketId)
  const { borrowToken } = (market && getTokens(market)) || {}

  return (
    borrowToken?.address &&
    debt && {
      chain: params.network.id,
      symbol: borrowToken.symbol,
      address: borrowToken.address,
      amount: debt,
    }
  )
}
