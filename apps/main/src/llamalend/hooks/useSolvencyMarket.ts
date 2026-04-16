import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { useBadDebtMarkets } from '@/llamalend/queries/market/market-bad-debt.query'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

/**
 * Returns solvency and insolvency data for a single market.
 */
export const useSolvencyMarket = ({ type, blockchainId, controllerAddress }: BadDebtParams) => {
  const enabled = !!blockchainId && !!controllerAddress
  const badDebtMarkets = useBadDebtMarkets({ type }, enabled)
  const llamaMarketQuery = useLlamaMarket({ blockchainId, controllerAddress })
  const market = llamaMarketQuery?.data

  const badDebtData = useMemo(() => {
    if (!blockchainId || !controllerAddress || !market || !badDebtMarkets.data) return undefined

    const badDebtUsd =
      badDebtMarkets.data.find(
        (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
      )?.badDebt ?? 0
    const exposureUsd =
      market.type === LlamaMarketType.Lend ? market.liquidityUsd + market.totalDebtUsd : market.totalDebtUsd

    const solvencyPercent = exposureUsd ? (Math.max(0, exposureUsd - badDebtUsd) / exposureUsd) * 100 : undefined

    return {
      badDebtUsd,
      solvencyPercent,
      insolvencyPercent: solvencyPercent == null ? undefined : 100 - solvencyPercent,
      marketType: market.type,
    }
  }, [badDebtMarkets.data, blockchainId, controllerAddress, market])

  return { data: badDebtData, ...combineQueryState(llamaMarketQuery, badDebtMarkets) }
}
