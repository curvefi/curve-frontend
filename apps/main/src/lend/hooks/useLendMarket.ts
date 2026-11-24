import { useCallback } from 'react'
import { useLlamaQuery } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

export const useLendMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) =>
  useCombinedQueries(
    [useLendMarkets({ chainId }, enabled), useLlamaQuery()],
    useCallback(
      (markets, api) => {
        const market = markets[rMarket]
        return market ? api.getLendMarketByData(market.id, market) : null
      },
      [rMarket],
    ),
  )
