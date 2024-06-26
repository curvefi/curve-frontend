import type { LlammaControllerEvent, LlammaTradeEvent } from '@/ui/Chart/types'

export type LlammaLiquidityCoins = {
  crvusd: {
    symbol: string
    address: string
  }
  collateral: {
    symbol: string
    address: string
  }
} | null

export type ChartOhlcWrapperProps = {
  rChainId: ChainId
  llamma: Llamma | null
  llammaId: string
}

export type LiqudityDataProps = {
  llammaControllerData: LlammaControllerEvent[]
  chainId: ChainId
  coins: LlammaLiquidityCoins
}

export type TradesDataProps = {
  llammaTradesData: LlammaTradeEvent[]
  chainId: ChainId
}
