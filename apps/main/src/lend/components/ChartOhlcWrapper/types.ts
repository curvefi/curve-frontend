import { ChainId } from '@/lend/types/lend.types'
import type { LlammaTrade, LlammaEvent } from '@curvefi/prices-api/llamma'

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

export interface PoolActivityProps {
  poolAddress: string
  chainId: ChainId
  coins: LendingMarketTokens
}

export interface LiquidityDataProps {
  lendControllerData: LlammaEvent[]
  chainId: ChainId
  coins: LendingMarketTokens
}

export interface TradesDataProps {
  lendTradesData: LlammaTrade[]
  chainId: ChainId
}

export type ChartOhlcWrapperProps = {
  rChainId: ChainId
  rOwmId: string
  userActiveKey: string
  betaBackgroundColor?: string
}
