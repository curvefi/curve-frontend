import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { useBadDebtMarketsQuery } from '@/llamalend/queries/market/market-bad-debt.query'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

export type BadDebtMarketData = {
  badDebtUsd: number
  solvencyPerc: number
  insolvencyPerc: number
  marketType: LlamaMarketType
}

/**
 * Returns solvency and insolvency data for a single market.
 */
export const useSolvencyMarket = ({ type, blockchainId, controllerAddress }: BadDebtParams) => {
  const enabled = !!blockchainId && !!controllerAddress
  const badDebtMarkets = useBadDebtMarketsQuery({ type }, enabled)
  const llamaMarkets = useLlamaMarkets(undefined, enabled)

  const badDebtData = useMemo(() => {
    if (!blockchainId || !controllerAddress || !llamaMarkets.data?.markets || !badDebtMarkets.data) return undefined

    const market = llamaMarkets.data.markets.find(
      (item) =>
        item.type === type && item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )

    if (market == null) return undefined

    const badDebtUsd =
      badDebtMarkets.data.find(
        (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
      )?.badDebt ?? 0
    const exposureUsd =
      market.type === LlamaMarketType.Lend ? market.liquidityUsd + market.totalDebtUsd : market.totalDebtUsd

    const solvencyPerc = exposureUsd ? (Math.max(0, exposureUsd - badDebtUsd) / exposureUsd) * 100 : 0

    return {
      badDebtUsd,
      solvencyPerc,
      insolvencyPerc: 100 - solvencyPerc,
      marketType: type,
    }
  }, [badDebtMarkets.data, blockchainId, controllerAddress, llamaMarkets.data, type])

  return { data: badDebtData, ...combineQueryState(llamaMarkets, badDebtMarkets) }
}
