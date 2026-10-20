import { formatChartAxisNumber } from '@evm-ui/shared/ui/Chart/chart.utils'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@evm-ui/shared/ui/Chart/ChartTooltipComponents'
import { formatNumber } from '@primitives/number.utils'
import type { LiquiditySample } from '@ui/features/pools/liquidity-density/types'
import { t } from '@ui/lib/i18n'

type LiquidityDensityTooltipProps = { sample: LiquiditySample; spot?: number; priceLabel: string }

export const LiquidityDensityTooltip = ({ sample, spot, priceLabel }: LiquidityDensityTooltipProps) => (
  <ChartTooltipShell
    testId="liquidity-density-tooltip"
    title={`${formatNumber(sample.price, 'token.precise')} ${priceLabel}`}
  >
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-depth"
        label={t`Liquidity per 1%`}
        value={formatChartAxisNumber(sample.depth, { unit: 'dollar' })}
      />
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-deviation"
        label={t`From current price`}
        value={formatNumber((sample.price / (spot ?? sample.price) - 1) * 100, 'percent.rate')}
      />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
