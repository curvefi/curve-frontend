import type { LlammaControllerEvent, LlammaTradeEvent } from '@/ui/Chart/types'

export interface LendingMarketTokens {
  borrowedToken?: {
    symbol: string
    address: string
  }
  collateralToken?: {
    symbol: string
    address: string
  }
}

export interface PoolActivityProps {
  poolAddress: string
  chainId: ChainId
  coins: LendingMarketTokens
}

export interface LiquidityDataProps {
  lendControllerData: LlammaControllerEvent[]
  chainId: ChainId
  coins: LendingMarketTokens
}

export interface TradesDataProps {
  lendTradesData: LlammaTradeEvent[]
  chainId: ChainId
}

export interface ChartOhlcWrapperProps {
  rChainId: ChainId
  userActiveKey: string
  rOwmId: string
}
