import ReactECharts from 'echarts-for-react'
import { type ReactNode, useMemo, useRef } from 'react'
import { useConnection } from 'wagmi'
import { CHART_LINE_DASH_PATTERNS } from '@evm-ui/shared/ui/Chart/chart.utils'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import { useEChartsTooltip } from '@evm-ui/shared/ui/Chart/hooks/useEChartsTooltip'
import { LegendLine } from '@evm-ui/shared/ui/Chart/LegendSet'
import Box from '@mui/material/Box'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Metric } from '@ui/components/Metric'
import { formatCategory } from '@ui/components/metric.utils'
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
  /** Density, sampled prices, range bounds and spot are valued in USD. */
  profile: QueryProp<LiquidityProfile>
  inputSymbol: string
  outputSymbol: string
  /** Reference prices in USD per input token. */
  oraclePrice: QueryProp<number>
  centerPrice: QueryProp<number>
  action: ReactNode
}

export const LiquidityDensityChart = ({
  profile,
  inputSymbol,
  outputSymbol,
  oraclePrice,
  centerPrice,
  action,
}: LiquidityDensityChartProps) => {
  const { data: profileData, isLoading: profileLoading, error: profileError } = profile
  const { data: oracle, isLoading: oracleLoading, error: oracleError } = oraclePrice
  const { data: center, isLoading: centerLoading, error: centerError } = centerPrice
  const theme = useTheme()
  const { isConnected } = useConnection()
  const { Chart, Color, Layer } = theme.design
  const { spot, samples } = profileData ?? {}
  const priceLabel = t`USD per ${inputSymbol}`
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

  const containerRef = useRef<HTMLDivElement>(null)
  const [width] = useResizeObserver(containerRef, { dimension: 'width' })
  const option = useLiquidityDensityChartOption({
    profile,
    markers,
    liquidityLabel,
    tooltipFormatter: useEChartsTooltip(samples, theme, sample => (
      <LiquidityDensityTooltip sample={sample} spot={spot} inputSymbol={inputSymbol} />
    )),
  })

  return (
    <Stack data-testid="liquidity-density-chart" sx={{ gap: Spacing.sm }}>
      <CardHeader
        title={
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
            <Typography
              component="h3"
              variant="headingXsBold"
              color="textSecondary"
              data-testid="liquidity-density-title"
            >
              {t`Liquidity density`}
            </Typography>
            {action}
          </Stack>
        }
      />
      <MetricsGrid>
        <Metric
          category="dex.liquidityDensity"
          label={t`Current price deviation`}
          labelTooltip={{ title: t`Absolute percentage distance of the current price from the center of liquidity.` }}
          value={combineQueries([profile, centerPrice], ({ spot }, center) =>
            center > 0 ? Math.abs(spot / center - 1) * 100 : undefined,
          )}
          valueOptions={formatCategory('percent.value')}
          testId="liquidity-density-deviation"
        />
        {markers.map(({ key, label, value, color, dash }) => (
          <Metric
            key={key}
            category="dex.liquidityDensity"
            label={label}
            value={value}
            valueOptions={formatCategory('usd.precise')}
            icon={
              value.data != null && (
                <Box component="span" sx={{ alignSelf: 'center', display: 'flex' }}>
                  <LegendLine color={color} dash={dash} />
                </Box>
              )
            }
            testId={`liquidity-density-${key}`}
          />
        ))}
      </MetricsGrid>
      <Box
        ref={containerRef}
        data-testid="liquidity-density-plot"
        role={samples?.length ? 'img' : undefined}
        aria-label={t`Liquidity density: ${priceLabel}. ${liquidityLabel}.`}
      >
        <EvmChartStateWrapper
          query={profile}
          height={CHART_HEIGHT}
          emptyState={{
            isEmpty: profile => !profile.samples.length,
            ...(isConnected
              ? {
                  description: t`Liquidity density is unavailable for this pool.`,
                  testId: 'liquidity-density-unavailable',
                }
              : {
                  title: t`Connect wallet`,
                  description: t`Please connect your wallet to view liquidity density.`,
                  testId: 'liquidity-density-connect-wallet',
                  button: { type: 'connect-wallet' },
                }),
          }}
          errorState={{ description: t`Unable to fetch liquidity density.` }}
        >
          {() => (
            <ReactECharts
              option={option}
              opts={{ renderer: 'svg' }}
              notMerge
              autoResize={false}
              style={{ width: width || '100%', height: CHART_HEIGHT }}
            />
          )}
        </EvmChartStateWrapper>
      </Box>
      <ChartFooter
        testId="liquidity-density-legend"
        legendSets={useMemo(
          () => [
            { label: inputSymbol ?? 'input', box: { fill: Chart.Lines[7] } },
            { label: outputSymbol ?? 'output', box: { fill: Chart.Lines[8] } },
          ],
          [Chart.Lines, inputSymbol, outputSymbol],
        )}
      />
    </Stack>
  )
}
