import type { BadDebtMarketData } from '@/llamalend/hooks/useSolvencyMarket'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

type Props = {
  solvencyPercent: BadDebtMarketData['solvencyPercent'] | undefined
  marketType: BadDebtMarketData['marketType']
}

const SOLVENCY_THRESHOLDS = {
  // Market above this threshold are considered fully solvent, and the banner should not be displayed
  solvent: 99.9,
  low: 90,
  insolvent: 0,
}

const BANNER_CONFIG = [
  {
    id: 'low',
    threshold: SOLVENCY_THRESHOLDS.low,
    title: t`Low Market Solvency`,
    lendSubtitle: t`Part of the supplied funds is no longer fully covered.`,
    severity: 'warning',
  },
  {
    id: 'insolvent',
    threshold: SOLVENCY_THRESHOLDS.insolvent,
    title: t`Very Low Market Solvency`,
    lendSubtitle: t`A large share of supplied funds is no longer fully covered.`,
    severity: 'alert',
  },
] as const

export const BadDebtBanner = ({ solvencyPercent, marketType }: Props) => {
  const banner =
    solvencyPercent != null &&
    solvencyPercent < SOLVENCY_THRESHOLDS.solvent &&
    BANNER_CONFIG.find((config) => solvencyPercent >= config.threshold)
  return (
    banner && (
      <Banner
        severity={banner.severity}
        subtitle={notFalsy(
          t`Market solvency is ${formatPercent(solvencyPercent)}.`,
          marketType === LlamaMarketType.Lend && banner.lendSubtitle,
        ).join(' ')}
        testId={`bad-debt-banner-${banner.id}`}
      >
        {banner.title}
      </Banner>
    )
  )
}
