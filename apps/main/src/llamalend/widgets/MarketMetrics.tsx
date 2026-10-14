import { MarketTypeSuffix } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import type { MarketType } from '@evm-ui/types/market'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { t } from '@ui/lib/i18n'
import { AvailableLiquidityTooltip } from './tooltips/AvailableLiquidityTooltip'
import { TooltipOptions } from './tooltips/tooltip.utils'
import { TotalCollateralTooltip } from './tooltips/TotalCollateralTooltip'

type MarketMetricProps = Pick<Parameters<typeof tokenMetric>[0], 'usdRate' | 'symbol' | 'value'> &
  Pick<MetricProps, 'category' | 'testId'>

export const TotalDebtMetric = ({ category, testId, ...tokenMetricProps }: MarketMetricProps) => (
  <Metric category={category} testId={testId} label={t`Total debt`} {...tokenMetric(tokenMetricProps)} />
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

export const AvailableLiquidityMetric = ({
  category,
  testId,
  marketType,
  ...tokenMetricProps
}: MarketMetricProps & { marketType: MarketType }) => (
  <Metric
    category={category}
    testId={testId}
    label={t`Available liquidity`}
    {...tokenMetric(tokenMetricProps)}
    valueTooltip={{
      title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
      body: <AvailableLiquidityTooltip marketType={marketType} />,
      ...TooltipOptions,
    }}
  />
)

export const TotalCollateralMetric = ({
  category,
  testId,
  tooltip,
  ...tokenMetricProps
}: MarketMetricProps & { tooltip: Parameters<typeof TotalCollateralTooltip>[0] }) => (
  <Metric
    category={category}
    testId={testId}
    label={t`Total collateral`}
    {...tokenMetric(tokenMetricProps)}
    valueTooltip={{ title: t`Total Collateral`, body: <TotalCollateralTooltip {...tooltip} />, ...TooltipOptions }}
  />
)
