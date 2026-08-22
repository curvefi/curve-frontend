import { SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import { t } from '@evm-ui/lib/i18n'
import { Banner } from '@evm-ui/shared/ui/Banner'
import { formatNumber } from '@evm-ui/utils'

type Props = {
  solvencyPercent: number
}

const BANNER_CONFIG = [
  {
    id: 'low',
    threshold: SOLVENCY_THRESHOLDS.low,
    severity: 'warning',
  },
  {
    id: 'insolvent',
    threshold: SOLVENCY_THRESHOLDS.insolvent,
    severity: 'alert',
  },
] as const

export const LowSolvencyBanner = ({ solvencyPercent }: Props) => {
  const banner =
    solvencyPercent < SOLVENCY_THRESHOLDS.solvent && BANNER_CONFIG.find(config => solvencyPercent >= config.threshold)
  return (
    banner && (
      <Banner
        severity={banner.severity}
        subtitle={t`Market solvency is ${formatNumber(solvencyPercent, 'percent.rate')}. Part of the supplied funds is no longer fully covered.`}
        testId={`bad-debt-banner-${banner.id}`}
        learnMoreUrl="https://docs.curve.finance/user/llamalend/bad-debt"
      >
        {t`Low Market Solvency`}
      </Banner>
    )
  )
}
