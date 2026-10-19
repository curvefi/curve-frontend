import { formatChartAxisNumber } from '@evm-ui/shared/ui/Chart/chart.utils'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@evm-ui/shared/ui/Chart/ChartTooltipComponents'
import { formatNumber } from '@primitives/number.utils'
import type { Unit } from '@primitives/units.util'
import type { LiquiditySample } from '@ui/features/pools/liquidity-density/types'
import { t } from '@ui/lib/i18n'
import type { LiquidityPriceMarker } from './LiquidityDensityChart'

type LiquidityDensityTooltipProps = {
  sample: LiquiditySample
  spot?: number
  priceLabel: string
  unit: Unit
  markers: LiquidityPriceMarker[]
}

export const LiquidityDensityTooltip = ({ sample, spot, priceLabel, unit, markers }: LiquidityDensityTooltipProps) => (
  <ChartTooltipShell
    testId="liquidity-density-tooltip"
    title={`${formatChartAxisNumber(sample.price, { abbreviateFrom: false, useGrouping: true, significantDigits: 8 })} ${priceLabel}`}
  >
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-depth"
        label={t`Liquidity per 1%`}
        value={formatChartAxisNumber(sample.depth, { unit })}
      />
      <ChartTooltipDataRow
        testId="liquidity-density-tooltip-deviation"
        label={t`From current price`}
        value={formatNumber((sample.price / (spot ?? sample.price) - 1) * 100, 'percent.rate')}
      />
      {markers.map(({ label, value, color }) => (
        <ChartTooltipDataRow
          key={label}
          label={label}
          value={formatChartAxisNumber(value, { abbreviateFrom: false, useGrouping: true, significantDigits: 8 })}
          valueColor={color}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
