import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { formatPercent } from '@ui-kit/utils'

type Props = {
  solvencyPercent: number
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
    severity: 'warning',
  },
  {
    id: 'insolvent',
    threshold: SOLVENCY_THRESHOLDS.insolvent,
    severity: 'alert',
  },
] as const

export const BadDebtBanner = ({ solvencyPercent }: Props) => {
  const banner =
    solvencyPercent < SOLVENCY_THRESHOLDS.solvent && BANNER_CONFIG.find((config) => solvencyPercent >= config.threshold)
  return (
    banner && (
      <Banner
        severity={banner.severity}
        subtitle={t`Market solvency is ${formatPercent(solvencyPercent)}. Part of the supplied funds is no longer fully covered.`}
        testId={`bad-debt-banner-${banner.id}`}
      >
        {t`Low Market Solvency`}
      </Banner>
    )
  )
}
