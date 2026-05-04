import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { t } from '@ui-kit/lib/i18n'
import { CHART_LINE_DASH_PATTERNS, type ChartLineDashPattern } from '@ui-kit/shared/ui/Chart'

export const priceLineLabels: Record<YieldKeys, { label: string; dash?: ChartLineDashPattern }> = {
  apyProjected: { label: t`APR` },
  proj_apy_7d_avg: { label: t`7-day MA APR`, dash: CHART_LINE_DASH_PATTERNS.movingAverage },
  proj_apy_total_avg: { label: t`Average APR`, dash: CHART_LINE_DASH_PATTERNS.average },
} as const
