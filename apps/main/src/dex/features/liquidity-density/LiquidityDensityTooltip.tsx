import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@evm-ui/shared/ui/Chart/ChartTooltipComponents'
import { formatNumber } from '@primitives/number.utils'
import { formatChartAxisNumber } from '@ui/features/charts/chart.utils'
import type { LiquiditySample } from '@ui/features/pools/liquidity-density/types'
import { t } from '@ui/lib/i18n'

type LiquidityDensityTooltipProps = { sample: LiquiditySample; spot?: number; inputSymbol: string }

export const LiquidityDensityTooltip = ({
  sample: { depth, price },
  spot,
  inputSymbol,
}: LiquidityDensityTooltipProps) => (
  <ChartTooltipShell
    testId="liquidity-density-tooltip"
    title={t`${formatNumber(price, 'usd.precise')} per ${inputSymbol}`}
  >
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-depth"
        label={t`Liquidity per 1%`}
        value={formatChartAxisNumber(depth, { unit: 'dollar' })}
      />
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-deviation"
        label={t`From current price`}
        value={formatNumber((price / (spot ?? price) - 1) * 100, 'percent.rate')}
      />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
