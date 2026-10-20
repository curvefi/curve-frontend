import ReactECharts from 'echarts-for-react'
import { type ReactNode, useMemo, useRef } from 'react'
import { useConnection } from 'wagmi'
import { CHART_LINE_DASH_PATTERNS } from '@evm-ui/shared/ui/Chart/chart.utils'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { ChartStateWrapper } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'
import { useEChartsTooltip } from '@evm-ui/shared/ui/Chart/hooks/useEChartsTooltip'
import { LegendLine } from '@evm-ui/shared/ui/Chart/LegendSet'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import type { LiquidityProfile } from '@ui/features/pools/liquidity-density/types'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import { Reds } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useResizeObserver } from '@ui/hooks/useResizeObserver'
import { t } from '@ui/lib/i18n'
import { useLiquidityDensityChartOption } from './hooks/useLiquidityDensityChartOption'
import { LiquidityDensityTooltip } from './LiquidityDensityTooltip'

const { Height, Spacing } = SizesAndSpaces
const CHART_HEIGHT = Height.chart.sm

export type LiquidityPriceMarker = {
  key: string
  label: string
  value: QueryProp<number>
  color: string
  dash: number[]
}

export type LiquidityDensityChartProps = {
  profile: QueryProp<LiquidityProfile>
  inputSymbol: string
  outputSymbol: string
  /** USD price of the output token, used to value the pair-denominated price metrics. */
  outputTokenUsdPrice: QueryProp<number>
  oraclePrice: QueryProp<number>
  centerPrice: QueryProp<number>
  action: ReactNode
}

export const LiquidityDensityChart = ({
  profile,
  inputSymbol,
  outputSymbol,
  outputTokenUsdPrice,
  oraclePrice,
  centerPrice,
  action,
}: LiquidityDensityChartProps) => {
  const { data: profileData, isLoading: profileLoading, error: profileError } = profile
  const { data: oracle, isLoading: oracleLoading, error: oracleError } = oraclePrice
  const { data: center, isLoading: centerLoading, error: centerError } = centerPrice
  const { isConnected } = useConnection()
  const theme = useTheme()
  const { Chart, Color, Layer } = theme.design
  const { spot, samples } = profileData ?? {}
  const priceLabel = t`${outputSymbol} per ${inputSymbol}`
  const liquidityLabel = t`Liquidity in 1% range in USD`
  const markers = useMemo(
    (): LiquidityPriceMarker[] => [
      {
        key: 'current-price',
        label: t`Current price`,
        value: q({ data: spot, isLoading: profileLoading, error: profileError }),
        color: Layer.Highlight.Outline,
        dash: CHART_LINE_DASH_PATTERNS.tight,
      },
      {
        key: 'center-price',
        label: t`Center of liquidity`,
        value: q({ data: center, isLoading: centerLoading, error: centerError }),
        color: Color.Tertiary[400],
        dash: CHART_LINE_DASH_PATTERNS.regular,
      },
      {
        key: 'oracle-price',
        label: t`Internal price oracle`,
        value: q({ data: oracle, isLoading: oracleLoading, error: oracleError }),
        color: Reds[500],
        dash: CHART_LINE_DASH_PATTERNS.regular,
      },
    ],
    [
      Layer.Highlight.Outline,
      Color.Tertiary,
      spot,
      profileLoading,
      profileError,
      center,
      centerLoading,
      centerError,
      oracle,
      oracleLoading,
      oracleError,
    ],
  )
  const deviation = combineQueries([profile, centerPrice], ({ spot }, center) =>
    center > 0 ? Math.abs(spot / center - 1) * 100 : undefined,
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [width] = useResizeObserver(containerRef, { dimension: 'width' })

  return (
    <Stack data-testid="liquidity-density-chart" sx={{ gap: Spacing.sm }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm }}>
        <Typography component="h3" variant="headingXsBold" color="textSecondary" data-testid="liquidity-density-title">
          {t`Liquidity density`}
        </Typography>
        {action}
      </Stack>
      <MetricsGrid>
        <Metric
          category="dex.liquidityDensity"
          label={t`Current price deviation`}
          labelTooltip={{ title: t`Absolute percentage distance of the current price from the center of liquidity.` }}
          value={deviation}
          valueOptions={{ abbreviate: false, formatter: value => formatNumber(value, 'percent.value') }}
          testId="liquidity-density-deviation"
        />
        {markers.map(({ key, label, value, color, dash }) => {
          const usdValue = combineQueries([value, outputTokenUsdPrice], (price, usdRate) => price * usdRate)
          return (
            <Metric
              key={key}
              category="dex.liquidityDensity"
              label={label}
              value={usdValue}
              valueOptions={{ abbreviate: false, formatter: value => formatNumber(value, 'usd.notional') }}
              icon={
                usdValue.data != null && (
                  <Box component="span" sx={{ alignSelf: 'center', display: 'flex' }}>
                    <LegendLine color={color} dash={dash} />
                  </Box>
                )
              }
              testId={`liquidity-density-${key}`}
            />
          )
        })}
      </MetricsGrid>
      <Box
        ref={containerRef}
        data-testid="liquidity-density-plot"
        role={samples?.length ? 'img' : undefined}
        aria-label={t`Liquidity density: ${priceLabel}. ${liquidityLabel}.`}
      >
        <ChartStateWrapper
          height={CHART_HEIGHT}
          isLoading={profileLoading}
          error={profileError}
          errorMessage={t`Unable to fetch liquidity density.`}
          isEmpty={!samples?.length}
          {...(isConnected
            ? {
                emptyMessage: t`Liquidity density is unavailable for this pool.`,
                emptyTestId: 'liquidity-density-unavailable',
              }
            : {
                emptyTitle: t`Connect wallet`,
                emptyMessage: t`Please connect your wallet to view liquidity density.`,
                emptyTestId: 'liquidity-density-connect-wallet',
              })}
        >
          <ReactECharts
            option={useLiquidityDensityChartOption({
              profile,
              markers,
              priceLabel,
              liquidityLabel,
              tooltipFormatter: useEChartsTooltip(samples, theme, sample => (
                <LiquidityDensityTooltip sample={sample} spot={spot} priceLabel={priceLabel} />
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
            { label: inputSymbol, box: { fill: Chart.Lines[7] } },
            { label: outputSymbol, box: { fill: Chart.Lines[8] } },
          ],
          [Chart.Lines, inputSymbol, outputSymbol],
        )}
        description={t`Curve’s AMM automatically rebalances liquidity to maximize liquidity depth, optimize LP revenues and provide better trade execution.`}
      />
    </Stack>
  )
}
