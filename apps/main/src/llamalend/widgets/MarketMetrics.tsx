import { tokenMetric } from '@/llamalend/llama.utils'
import { TooltipOptions } from '@/llamalend/widgets/tooltips'
import { Metric, type MetricProps } from '@evm-ui/shared/ui/Metric'
import { t } from '@ui/lib/i18n'

type MarketMetricProps = Pick<Parameters<typeof tokenMetric>[0], 'usdRate' | 'symbol' | 'value'> &
  Pick<MetricProps, 'category' | 'testId'>

export const TotalBorrowedMetric = ({ category, testId, ...tokenMetricProps }: MarketMetricProps) => (
  <Metric category={category} testId={testId} label={t`Total borrowed`} {...tokenMetric(tokenMetricProps)} />
)

export const TotalLiquidityMetric = ({ category, testId, ...tokenMetricProps }: MarketMetricProps) => (
  <Metric
    category={category}
    testId={testId}
    label={t`Total liquidity`}
    {...tokenMetric(tokenMetricProps)}
    valueTooltip={{
      title: t`Total liquidity`,
      body: t`Total liquidity is the total amount of the borrow token supplied to this lending market, including both available and borrowed liquidity.`,
      ...TooltipOptions,
    }}
  />
)
