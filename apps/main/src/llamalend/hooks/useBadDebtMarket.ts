import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { useBadDebtMarketsQuery } from '@/llamalend/queries/market/market-bad-debt.query'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { combineQueryState } from '@ui-kit/lib'
import { BannerSeverity } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

export type BadDebtMarketData = {
  badDebtUsd: number
  percentage: number
  marketType: LlamaMarketType
  severity: BannerSeverity
}

// Bad debt threshold values expressed as percentages (e.g. 0.1 = 0.1%).
const BAD_DEBT_THRESHOLDS = {
  // Hide the banner if it is below the safe threshold.
  safe: 0.1,
  // Show a warning banner if it is below the warning threshold. Anything above this has alert severity.
  warning: 80,
}

// Returns bad debt data with banner severity, or null when it is below the display threshold.
const getBadDebtMarketSeverity = (data: Omit<BadDebtMarketData, 'severity'>): BadDebtMarketData | null => {
  if (data.percentage < BAD_DEBT_THRESHOLDS.safe) {
    return null
  } else if (data.percentage < BAD_DEBT_THRESHOLDS.warning) {
    return { ...data, severity: 'warning' }
  }
  return { ...data, severity: 'alert' }
}

/**
 * Returns bad debt data for a single market if the bad debt with the market exposure value ratio, are above a threshold
 */
export const useBadDebtMarket = ({ type, blockchainId, controllerAddress }: BadDebtParams) => {
  const enabled = !!blockchainId && !!controllerAddress
  const badDebtMarkets = useBadDebtMarketsQuery({ type }, enabled)
  const llamaMarkets = useLlamaMarkets(undefined, enabled)

  const badDebtData = useMemo(() => {
    if (!blockchainId || !controllerAddress || !llamaMarkets.data?.markets?.length || !badDebtMarkets.data?.length)
      return null

    const badDebtUsd = badDebtMarkets.data.find(
      (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )?.badDebt

    const market = llamaMarkets.data.markets.find(
      (item) =>
        item.type === type && item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )

    const exposureUsd =
      market && (market.type === LlamaMarketType.Lend ? market.liquidityUsd + market.totalDebtUsd : market.totalDebtUsd)

    return badDebtUsd && exposureUsd
      ? getBadDebtMarketSeverity({
          badDebtUsd,
          percentage: (badDebtUsd / exposureUsd) * 100,
          marketType: type,
        })
      : null
  }, [badDebtMarkets.data, blockchainId, controllerAddress, llamaMarkets.data, type])

  return { data: badDebtData, ...combineQueryState(llamaMarkets, badDebtMarkets) }
}
