import { useCallback } from 'react'
import { useLlamaQuery } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

export const useMintMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) =>
  useCombinedQueries(
    [useMintMarkets({ chainId }, enabled), useLlamaQuery()],
    useCallback((markets, api) => maybe(markets[rMarket], m => api.getMintMarketByData(m.id, m)) ?? null, [rMarket]),
  )
