import { useCallback, useMemo } from 'react'
import type { LlamaApi } from '@evm-ui/features/connect-wallet'
import { useLlamaQuery } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { useCombinedQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { useMappedQuery } from '@ui/features/queries/util'
import { type MintMarketData, useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

function useMintMarketData({ chainId, rMarket }: MarketUrlParams, enabled?: boolean) {
  const mintMarkets = useMintMarkets({ chainId }, enabled)
  const mintMarket = useMappedQuery(
    mintMarkets,
    useCallback(data => data?.[rMarket], [rMarket]),
  )
  const error = useMemo(
    () => mintMarkets.data && !mintMarket.data && new Error(`${t`Market`} ${rMarket} ${t`Not Found`}`),
    [mintMarket.data, mintMarkets.data, rMarket],
  )
  return { ...mintMarket, ...(error && { error }) }
}

const getMintMarketByData = (data: MintMarketData, api: LlamaApi) => api.getMintMarketByData(data.id, data)

export const useMintMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) =>
  useCombinedQueries([useMintMarketData({ chainId, rMarket }, enabled), useLlamaQuery()], getMintMarketByData)
