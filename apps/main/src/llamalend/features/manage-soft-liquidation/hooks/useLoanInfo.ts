import { useConnection } from 'wagmi'
import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { useUserState } from '@/llamalend/queries/user'
import type { ActionInfosProps } from '..'
import type { MarketParams } from '../types'
import { useCollateralToRecover } from './useCollateralToRecover'

/**
 * This hook aggregates data from multiple sources to provide a complete picture of a user's loan position,
 * including debt amounts, borrow rates, and recoverable collateral. It's primarily used in the manage
 * soft liquidation's action cards display current loan status and help users make informed decisions about
 * their positions.
 */
export function useLoanInfo(params: MarketParams): ActionInfosProps['loanInfo'] {
  const { address: userAddress } = useConnection()
  const { data: userState } = useUserState({ ...params, userAddress })

  const collateralToRecover = useCollateralToRecover(params)

  const market = getLlamaMarket(params.marketId)
  const { symbol } = (market && getTokens(market))?.borrowToken || {}
  const { stablecoin } = userState ?? {}
  const debt = (stablecoin && symbol && { symbol, amount: +stablecoin }) || undefined

  const { data: rates } = useMarketRates(params)

  const borrowRate = rates && {
    current: +rates.borrowApr,
    future_rate: undefined, // TODO: Determine how to calculate future rate based on user input
  }

  return {
    borrowRate,
    debt,
    ltv: undefined, // I don't know yet how to determine it so it's not available for now
    collateral: (collateralToRecover ?? []).filter(
      (item): item is typeof item & { amount: number } => item.amount != null && +item.amount > 0,
    ),
  }
}
