import type { EChartsOption, LineSeriesOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { type RefObject, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybes } from '@primitives/objects.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { CHART_LINE_DASH_PATTERNS, CHART_LINE_WIDTHS } from '@ui/features/charts/chart.utils'
import { ChartFooter } from '@ui/features/charts/ChartFooter'
import { DialogFullscreen } from '@ui/features/charts/DialogFullscreen'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useBreakpoint } from '@ui/hooks/useBreakpoints'
import { useResizeObserver } from '@ui/hooks/useResizeObserver'
import { useSwitch } from '@ui/hooks/useSwitch'
import { ArrowsSize } from '@ui/icons/ArrowsSize'
import { DownloadIcon } from '@ui/icons/DownloadIcon'
import { t } from '@ui/lib/i18n'
import { cryptoswapPreview } from './cryptoswap-preview'

const { Spacing, Height, FontSize, LineHeight, BorderWidth } = SizesAndSpaces

const PreviewChart = ({
  chartRef,
  option,
  fullscreen,
}: {
  chartRef: RefObject<ReactECharts | null>
  option: EChartsOption
  fullscreen: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, height] = useResizeObserver(containerRef)
  return (
    <Box ref={containerRef} sx={{ minWidth: 0, minHeight: Height.chart.sm, ...(fullscreen && { flexGrow: 1 }) }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge
        autoResize={false}
        style={{ width: width || '100%', height: height || Height.chart.sm }}
      />
    </Box>
  )
}

export const CryptoswapLiquidityDepthPreview = ({
  amplification,
  gamma,
  initialPrice,
  tokenCount,
}: {
  amplification: Decimal | undefined
  gamma: Decimal | undefined
  initialPrice: Decimal | undefined
  tokenCount: 2 | 3
}) => {
  const theme = useTheme()
  const breakpoint = useBreakpoint()
  const { Chart, Color, Text } = theme.design
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const chartRef = useRef<ReactECharts>(null)
  const preview = useMemo(
    () =>
      maybes([amplification, gamma, initialPrice], (a, gamma, price) =>
        +price ? cryptoswapPreview(+a, +gamma, tokenCount) : undefined,
      ),
    [amplification, gamma, initialPrice, tokenCount],
  )
  const px = (value: string) => Number.parseFloat(value) * theme.typography.htmlFontSize
  const textStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: px(FontSize.xs[breakpoint]),
    lineHeight: px(LineHeight.xs[breakpoint]),
    color: Text.TextColors.Tertiary,
  }
  const gridLine = { color: Color.Neutral[300], width: px(BorderWidth.thin) }
  const series = [
    {
      label: t`This pool`,
      color: Chart.Lines[1],
      dash: undefined,
      data: preview?.samples.map(({ deviation, depth }) => [deviation, depth]) ?? [],
      band: preview?.band,
    },
    {
      label: t`Uniswap v2, same deposit`,
      color: Text.TextColors.Secondary,
      dash: CHART_LINE_DASH_PATTERNS.short,
      data: preview?.samples.map(({ deviation }) => [deviation, 1]) ?? [],
      band: undefined,
    },
  ]
  const option: EChartsOption = {
    animation: false,
    textStyle,
    grid: {
      left: 0,
      right: px(Spacing.xs[breakpoint]),
      top: px(Spacing.sm[breakpoint]),
      bottom: px(Spacing.xs[breakpoint]),
      outerBoundsMode: 'same',
      outerBoundsContain: 'all',
    },
    xAxis: {
      type: 'value',
      scale: true,
      splitNumber: 6,
      axisLabel: {
        ...textStyle,
        formatter: (value: number) =>
          value === 0
            ? formatNumber(Number(initialPrice), {
                abbreviate: false,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : `${value > 0 ? '+' : ''}${formatNumber(value, 'percent.value')}`,
      },
      splitLine: { lineStyle: gridLine },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      min: 0,
      axisLabel: { ...textStyle, formatter: (value: number) => formatNumber(value, 'multiplier') },
      splitLine: { lineStyle: gridLine },
    },
    tooltip: { trigger: 'axis', valueFormatter: value => formatNumber(Number(value), 'multiplier') },
    series: series.map(({ label, color, dash, data, band }): LineSeriesOption => ({
      type: 'line',
      name: label,
      data,
      showSymbol: false,
      lineStyle: { color, width: CHART_LINE_WIDTHS.referenceLine, type: dash ?? 'solid' },
      itemStyle: { color },
      ...(band && {
        markArea: {
          silent: true,
          itemStyle: { color: Chart.Lines[1], opacity: 0.1 },
          data: [[{ xAxis: band[0] }, { xAxis: band[1] }]],
        },
      }),
    })),
  }

  return (
    <WithWrapper shouldWrap={fullscreen} Wrapper={DialogFullscreen} onClose={closeFullscreen}>
      <Stack
        sx={{
          gap: Spacing.sm,
          backgroundColor: 'background.paper',
          ...(fullscreen && { padding: Spacing.md, height: '100%' }),
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="headingXsBold">{t`Liquidity depth around the price`}</Typography>
          <Stack direction="row">
            <IconButton
              size="extraSmall"
              color="ghost"
              aria-label={t`Download chart`}
              disabled={!preview}
              onClick={() => {
                const link = document.createElement('a')
                link.download = 'cryptoswap-depth.png'
                link.href = chartRef
                  .current!.getEchartsInstance()
                  .getDataURL({ pixelRatio: window.devicePixelRatio, backgroundColor: theme.palette.background.paper })
                link.click()
              }}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              size={fullscreen ? 'small' : 'extraSmall'}
              color="ghost"
              aria-label={fullscreen ? t`Collapse chart` : t`Expand chart`}
              onClick={toggleFullscreen}
            >
              <ArrowsSize />
            </IconButton>
          </Stack>
        </Stack>
        {preview ? (
          <>
            <Stack direction="row" sx={{ gap: Spacing.sm }}>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="bodyXsRegular" color="textSecondary">{t`Depth near the price`}</Typography>
                <Typography variant="bodySBold">{formatNumber(preview.depth, 'multiplier')} Uniswap v2</Typography>
              </Stack>
              <Stack sx={{ flex: 1 }}>
                <Tooltip title={t`Estimated range where excess depth above Uniswap v2 remains at least half its peak.`}>
                  <Typography variant="bodyXsRegular" color="textSecondary">{t`Concentrated range`}</Typography>
                </Tooltip>
                <Typography variant="bodySBold">
                  {preview.band
                    ? t`${formatNumber(preview.band[0], 'percent.delta')} to ${formatNumber(preview.band[1], 'percent.delta')}`
                    : UNAVAILABLE_NOTATION}
                </Typography>
              </Stack>
            </Stack>
            <PreviewChart chartRef={chartRef} option={option} fullscreen={fullscreen} />
            <ChartFooter
              legendSets={series.map(({ label, color, dash }) => ({ label, line: { lineStroke: color, dash } }))}
              description={t`Re-centring depends on the price oracle, adjustment step and accumulated profits.`}
            />
            {tokenCount === 3 && (
              <Typography variant="bodyXsRegular" color="textSecondary">
                {t`Preview for the first two tokens; the third reserve stays balanced.`}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="bodySRegular">{t`Enter valid amplification, gamma and initial price to preview the curve.`}</Typography>
        )}
      </Stack>
    </WithWrapper>
  )
}
