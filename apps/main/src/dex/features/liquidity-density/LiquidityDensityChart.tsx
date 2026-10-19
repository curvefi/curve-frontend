import ReactECharts from 'echarts-for-react'
import { type ReactNode, useMemo, useRef } from 'react'
import { useConnection } from 'wagmi'
import { CHART_LINE_DASH_PATTERNS } from '@evm-ui/shared/ui/Chart/chart.utils'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { ChartStateWrapper } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'
import { useEChartsTooltip } from '@evm-ui/shared/ui/Chart/hooks/useEChartsTooltip'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { getUnitOptions, type Unit } from '@primitives/units.util'
import type { LiquidityProfile } from '@ui/features/pools/liquidity-density/types'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useResizeObserver } from '@ui/hooks/useResizeObserver'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { useLiquidityDensityChartOption } from './hooks/useLiquidityDensityChartOption'
import { LiquidityDensityTooltip } from './LiquidityDensityTooltip'

const { Height, Spacing } = SizesAndSpaces
const CHART_HEIGHT = Height.chart.sm

export type LiquidityPriceMarker = { label: string; value: number; color: string; dash?: number[]; showPrice?: boolean }

export type LiquidityDensityChartProps = {
  profile?: LiquidityProfile
  inputSymbol: string
  outputSymbol: string
  unit: Unit
  oraclePrice?: number
  centerPrice?: number
  isLoading?: boolean
  error?: Error | null
  action?: ReactNode
}

export const LiquidityDensityChart = ({
  profile,
  inputSymbol,
  outputSymbol,
  unit,
  oraclePrice,
  centerPrice,
  isLoading = false,
  error,
  action,
}: LiquidityDensityChartProps) => {
  const { isConnected } = useConnection()
  const theme = useTheme()
  const { Chart, Color } = theme.design
  const { spot, low, high, samples } = profile ?? {}
  const priceLabel = t`${outputSymbol} per ${inputSymbol}`
  const liquidityLabel = t`Liquidity in 1% range in ${unit === 'dollar' ? 'USD' : getUnitOptions(unit)?.symbol || UNAVAILABLE_TOKEN_SYMBOL}`
  const markers = useMemo(
    () =>
      notFalsy<LiquidityPriceMarker>(
        oraclePrice && { label: t`Internal price oracle`, value: oraclePrice, color: Color.Primary[500] },
        centerPrice && {
          label: t`Center of liquidity`,
          value: centerPrice,
          color: Color.Tertiary[400],
          dash: CHART_LINE_DASH_PATTERNS.regular,
        },
        spot && {
          label: t`Current price`,
          value: spot,
          color: Chart.Lines[1],
          dash: CHART_LINE_DASH_PATTERNS.tight,
          showPrice: true,
        },
      ),
    [Chart.Lines, Color.Primary, Color.Tertiary, centerPrice, oraclePrice, spot],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [width] = useResizeObserver(containerRef, { dimension: 'width' })

  return (
    <Card size="small" data-testid="liquidity-density-chart">
      <CardHeader title={t`Liquidity distribution`} action={action} data-testid="liquidity-density-title" />
      <CardContent component={Stack} sx={{ gap: Spacing.sm }}>
        <Box
          ref={containerRef}
          data-testid="liquidity-density-plot"
          role={samples?.length ? 'img' : undefined}
          aria-label={t`Liquidity distribution: ${priceLabel}. ${liquidityLabel}.`}
        >
          <ChartStateWrapper
            height={CHART_HEIGHT}
            isLoading={isLoading}
            error={error}
            errorMessage={t`Unable to fetch liquidity distribution.`}
            isEmpty={!samples?.length || low == null || high == null}
            {...(isConnected
              ? {
                  emptyMessage: t`Liquidity distribution is unavailable for this pool.`,
                  emptyTestId: 'liquidity-density-unavailable',
                }
              : {
                  emptyTitle: t`Connect wallet`,
                  emptyMessage: t`Please connect your wallet to view liquidity distribution.`,
                  emptyTestId: 'liquidity-density-connect-wallet',
                })}
          >
            <ReactECharts
              option={useLiquidityDensityChartOption({
                profile,
                markers,
                priceLabel,
                liquidityLabel,
                unit,
                tooltipFormatter: useEChartsTooltip(samples, theme, sample => (
                  <LiquidityDensityTooltip
                    sample={sample}
                    spot={spot}
                    priceLabel={priceLabel}
                    unit={unit}
                    markers={markers}
                  />
                )),
              })}
              notMerge
              autoResize={false}
              style={{ width: width || '100%', height: CHART_HEIGHT }}
            />
          </ChartStateWrapper>
        </Box>
        <ChartFooter
          testId="liquidity-density-legend"
          legendSets={useMemo(
            () => [
              ...markers.map(({ label, color, dash }) => ({ label, line: { lineStroke: color, dash } })),
              { label: inputSymbol, box: { fill: Chart.Lines[2] } },
              { label: outputSymbol, box: { fill: Chart.Lines[1] } },
            ],
            [Chart.Lines, inputSymbol, markers, outputSymbol],
          )}
          description={t`Curve’s AMM automatically rebalances liquidity to maximize liquidity depth, optimize LP revenues and provide better trade execution.`}
        />
      </CardContent>
    </Card>
  )
}
