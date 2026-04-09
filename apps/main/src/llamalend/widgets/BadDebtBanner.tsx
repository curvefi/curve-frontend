import type { BadDebtMarketData } from '@/llamalend/hooks/useSolvencyMarket'
import { t } from '@ui-kit/lib/i18n'
import { Banner, BannerProps } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

type Props = {
  solvencyPerc: BadDebtMarketData['solvencyPerc'] | undefined
  marketType: BadDebtMarketData['marketType']
}

type BannerConfig = {
  title: string
  subtitle: string
  severity: BannerProps['severity']
} | null

const SOLVENCY_THRESHOLDS = {
  // Market above this threshold are considered fully solvent.
  solvent: 98,
  reduced: 90,
  // Markets below this threshold have a very low solvency.
  low: 80,
}

const getBannerConfigs = ({ solvencyPerc, marketType }: Props): BannerConfig => {
  if (solvencyPerc == null) return null
  const formattedSolvency = formatPercent(solvencyPerc)
  const isLend = marketType === LlamaMarketType.Lend

  if (solvencyPerc >= SOLVENCY_THRESHOLDS.solvent) {
    return null
  } else if (solvencyPerc >= SOLVENCY_THRESHOLDS.reduced) {
    return {
      title: t`Reduced Market Solvency`,
      subtitle: t`Market solvency is ${formattedSolvency}. ${isLend ? 'A small share of supplied funds is not fully covered.' : ''}`,
      severity: 'warning',
    }
  } else if (solvencyPerc >= SOLVENCY_THRESHOLDS.low)
    return {
      title: t`Low Market Solvency`,
      subtitle: t`Market solvency is ${formattedSolvency}. ${isLend ? 'Part of the supplied funds is no longer fully covered.' : ''}`,
      severity: 'warning',
    }

  return {
    title: t`Very Low Market Solvency`,
    subtitle: t`Market solvency is ${formattedSolvency}. ${isLend ? 'A large share of supplied funds is no longer fully covered.' : ''}`,
    severity: 'alert',
  }
}

export const BadDebtBanner = (props: Props) => {
  const banner = getBannerConfigs(props)
  return banner ? (
    <Banner severity={banner.severity} subtitle={banner.subtitle}>
      {banner.title}
    </Banner>
  ) : null
}
