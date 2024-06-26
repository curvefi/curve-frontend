import type { LlammaControllerEvent, LlammaTradeEvent } from '@/ui/Chart/types'

export type LendingMarketTokens = {
  borrowedToken: {
    symbol: string
    address: string
  }
  collateralToken: {
    symbol: string
    address: string
  }
} | null

export type PoolActivityProps = {
  poolAddress: string
  chainId: ChainId
  coins: LendingMarketTokens
}

export type LiquidityDataProps = {
  lendControllerData: LlammaControllerEvent[]
  chainId: ChainId
  coins: LendingMarketTokens
}

export type TradesDataProps = {
  lendTradesData: LlammaTradeEvent[]
  chainId: ChainId
}

export type ChartOhlcWrapperProps = {
  rChainId: ChainId
  userActiveKey: string
  rOwmId: string
}
