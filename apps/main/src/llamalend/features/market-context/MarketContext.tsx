import { createContext, use } from 'react'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { assert } from '@curvefi/primitives/objects.utils'
import { type MarketContextValue } from './MarketContextValue'

export const MarketContext = createContext<MarketContextValue<IChainId> | undefined>(undefined)

export const useMarketContext = <ChainId extends IChainId = IChainId>() =>
  assert(use(MarketContext), 'useMarketContext must be used within MarketContext') as MarketContextValue<ChainId>
