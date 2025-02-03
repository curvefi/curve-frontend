import type { LlammaControllerEvent } from '@ui/Chart/types'
import { ChainId } from '@/lend/types/lend.types'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'

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
  lendControllerData: LlammaControllerEvent[]
  chainId: ChainId
  coins: LendingMarketTokens
}

export interface TradesDataProps {
  lendTradesData: LlammaTrade[]
  chainId: ChainId
}

export interface ChartOhlcWrapperProps {
  rChainId: ChainId
  userActiveKey: string
  rOwmId: string
}
