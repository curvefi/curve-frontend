import type { EChartsOption, LineSeriesOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { WithWrapper } from '@ui/components/WithWrapper'
import { CHART_LINE_DASH_PATTERNS, CHART_LINE_WIDTHS, formatChartAxisNumber } from '@ui/features/charts/chart.utils'
import { ChartFooter } from '@ui/features/charts/ChartFooter'
import { DialogFullscreen } from '@ui/features/charts/DialogFullscreen'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useBreakpoint } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { ArrowsSize } from '@ui/icons/ArrowsSize'
import { DownloadIcon } from '@ui/icons/DownloadIcon'
import { t } from '@ui/lib/i18n'
import { STABLESWAP_PREVIEW_PAIR, STABLESWAP_PREVIEW_PRICE_BAND, stableswapPreview } from './stableswap-preview'

const { Spacing, Height, FontSize, LineHeight, BorderWidth } = SizesAndSpaces
const REFERENCE_AMPLIFICATION = 10
// Figma's comparison window: 5–95% token share and prices within 6% of the peg.
const SHARE_AXIS = { min: 5, max: 95, interval: 15 }
const PRICE_AXIS = { min: 0.94, max: 1.06, interval: 0.03 }

export const StableswapPricePreview = ({
  amplification,
  tokenCount,
  tokenSymbol,
}: {
  amplification: Decimal | undefined
  tokenCount: number
  tokenSymbol: string | undefined
}) => {
  const theme = useTheme()
  const breakpoint = useBreakpoint()
  const { Chart, Color, Text } = theme.design
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const px = (value: string) => Number.parseFloat(value) * theme.typography.htmlFontSize
  const textStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: px(FontSize.xs[breakpoint]),
    lineHeight: px(LineHeight.xs[breakpoint]),
    color: Text.TextColors.Tertiary,
  }
  const gridLine = { color: Color.Neutral[300], width: px(BorderWidth.thin) }
  const chartRef = useRef<ReactECharts>(null)
  const preview = useMemo(
    () => maybe(amplification, value => stableswapPreview(+value, tokenCount)),
    [amplification, tokenCount],
  )
  const reference = useMemo(() => stableswapPreview(REFERENCE_AMPLIFICATION, tokenCount), [tokenCount])

  const series = [
    {
      label: `${t`A`} = ${amplification}, ${t`this pool`}`,
      color: Chart.Lines[1],
      dash: undefined,
      data: preview?.samples.map(({ share, price }) => [share, price]) ?? [],
      band: preview?.band,
    },
    {
      label: `${t`A`} = ${REFERENCE_AMPLIFICATION}`,
      color: Chart.Lines[2],
      dash: undefined,
      data: useMemo(
        () =>
          // ECharts groups axis tooltips by x value. Sample the reference at this pool's shares to keep all three rows.
          preview?.samples.map(({ share }) => [
            share,
            maybe(reference, ({ samples }) => {
              const index = samples.findIndex(sample => sample.share >= share)
              const right = samples[index]
              if (right?.share === share) return right.price
              return maybes(
                [samples[index - 1], right],
                (left, right) =>
                  left.price + ((share - left.share) * (right.price - left.price)) / (right.share - left.share),
              )
            }) ?? null,
          ]) ?? [],
        [preview, reference],
      ),
      band: undefined,
    },
    {
      label: t`Uniswap v2`,
      color: Text.TextColors.Secondary,
      dash: CHART_LINE_DASH_PATTERNS.short,
      data: preview?.samples.map(({ share, constantProductPrice }) => [share, constantProductPrice]) ?? [],
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
      ...SHARE_AXIS,
      axisLabel: { ...textStyle, formatter: '{value}%' },
      splitLine: { lineStyle: gridLine },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      ...PRICE_AXIS,
      axisLabel: { ...textStyle, formatter: (value: number) => formatChartAxisNumber(value) },
      splitLine: { lineStyle: gridLine },
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      transitionDuration: 0,
      order: 'seriesAsc',
      axisPointer: {
        snap: true,
        label: {
          formatter: ({ value }) => `${formatNumber(Number(value), 'percent.value')} ${tokenSymbol ?? t`Token 1`}`,
        },
      },
      valueFormatter: value => `${formatChartAxisNumber(Number(value))}× ${t`rate`}`,
    },
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
          <Typography variant="headingXsBold">{t`Price as the pool gets imbalanced`}</Typography>
          <Stack direction="row">
            <IconButton
              size="extraSmall"
              color="ghost"
              aria-label={t`Download chart`}
              disabled={!preview}
              onClick={() => {
                const link = document.createElement('a')
                link.download = 'stableswap-price.png'
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
                <Typography
                  variant="bodyXsRegular"
                  color="textSecondary"
                >{t`Holds within ${formatNumber(STABLESWAP_PREVIEW_PRICE_BAND * 100, 'percent.rate')} of the rate`}</Typography>
                <Typography variant="bodySBold">
                  {preview.band
                    ? t`${formatNumber(preview.band[0], 'percent.value')} to ${formatNumber(preview.band[1], 'percent.value')} ${tokenSymbol ?? t`Token 1`}`
                    : UNAVAILABLE_NOTATION}
                </Typography>
              </Stack>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="bodyXsRegular" color="textSecondary">{t`Amplification`}</Typography>
                <Typography variant="bodySBold">A = {amplification}</Typography>
              </Stack>
            </Stack>
            <Box sx={{ position: 'relative', minHeight: Height.chart.sm, ...(fullscreen && { flexGrow: 1 }) }}>
              <ReactECharts
                ref={chartRef}
                option={option}
                notMerge
                style={{ height: fullscreen ? '100%' : Height.chart.sm }}
              />
            </Box>
            <ChartFooter
              legendSets={series.map(({ label, color, dash }) => ({ label, line: { lineStroke: color, dash } }))}
              description={t`Higher A keeps the price closer to the rate, then breaks harder when one side runs out.`}
            />
            {tokenCount > STABLESWAP_PREVIEW_PAIR.length && (
              <Typography
                variant="bodyXsRegular"
                color="textSecondary"
              >{t`Share of the first two tokens; other reserves stay balanced.`}</Typography>
            )}
          </>
        ) : (
          <Typography variant="bodySRegular">{t`Enter a valid amplification to preview the curve.`}</Typography>
        )}
      </Stack>
    </WithWrapper>
  )
}
