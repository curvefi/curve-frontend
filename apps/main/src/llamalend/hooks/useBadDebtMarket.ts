import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useBadDebtMarketsQuery } from '@/llamalend/queries/market/market-bad-debt.query'
import { useMarketExposureQuery } from '@/llamalend/queries/market/market-exposure.query'
import { BannerSeverity } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
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
 * Returns bad debt data for a single market if the bad debt with the market exposure value ratio, are above threshold
 */
export const useBadDebtMarket = ({
  type,
  blockchainId,
  controllerAddress,
}: BadDebtParams & {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}) => {
  const enabled = !!blockchainId && !!controllerAddress
  const { data: badDebtMarkets } = useBadDebtMarketsQuery({ type }, enabled)
  const { data: marketExposure } = useMarketExposureQuery({ type }, enabled)

  return useMemo(() => {
    if (!blockchainId || !controllerAddress || !badDebtMarkets?.length) return null

    const market = badDebtMarkets.find(
      (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )
    const exposureUsd = marketExposure?.find(
      (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )?.exposureUsd

    if (market?.badDebt == null || exposureUsd == null) return null

    return getBadDebtMarketSeverity({
      badDebtUsd: market.badDebt,
      percentage: (market.badDebt / exposureUsd) * 100,
      marketType: type,
    })
  }, [badDebtMarkets, blockchainId, controllerAddress, marketExposure, type])
}
