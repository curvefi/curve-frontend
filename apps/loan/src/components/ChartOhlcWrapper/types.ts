import type { LlammaControllerEvent, LlammaTradeEvent } from '@/ui/Chart/types'

export interface LlammaLiquidityCoins {
  crvusd?: {
    symbol: string
    address: string
  }
  collateral?: {
    symbol: string
    address: string
  }
}

export interface ChartOhlcWrapperProps {
  rChainId: ChainId
  llamma: Llamma | null
  llammaId: string
}

export interface LiqudityDataProps {
  llammaControllerData: LlammaControllerEvent[]
  chainId: ChainId
  coins: LlammaLiquidityCoins
}

export interface TradesDataProps {
  llammaTradesData: LlammaTradeEvent[]
  chainId: ChainId
}
