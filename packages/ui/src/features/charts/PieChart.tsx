import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { type ReactNode, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useResizeObserver } from '@ui/hooks/useResizeObserver'
import { createChartSeriesColorScale } from './chart.utils'

const { IconSize, Spacing, Width } = SizesAndSpaces

type PieChartItem = { id: string; name: string | undefined; value: number | undefined }

export const PieChart = ({
  data,
  formatValue = String,
  children,
  centerSize = 'lg',
  height,
  testId = 'pie-chart',
}: {
  data: PieChartItem[]
  formatValue?: (value: number | undefined) => string
  children?: ReactNode
  centerSize?: keyof typeof IconSize
  height?: number
  testId?: string
}) => {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, chartHeight] = useResizeObserver(containerRef)
  const centerRef = useRef<HTMLDivElement>(null)
  const hasCenter = !!children
  const [centerWidth] = useResizeObserver(centerRef, { enabled: hasCenter, dimension: 'width' })
  const seriesData = useMemo(() => {
    const colors = createChartSeriesColorScale(theme)
    return data.map((item, index) => ({ ...item, itemStyle: { color: colors[index % colors.length] } }))
  }, [data, theme])
  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      textStyle: { fontFamily: theme.typography.fontFamily },
      tooltip: {
        trigger: 'item',
        renderMode: 'html',
        appendToBody: true,
        confine: true,
        backgroundColor: theme.design.Layer[1].Fill,
        borderColor: theme.design.Layer[3].Outline,
        textStyle: { color: theme.design.Text.TextColors.Primary },
        valueFormatter: value => formatValue(value as number | undefined),
      },
      series: [
        {
          type: 'pie',
          radius: [hasCenter && centerWidth != null ? centerWidth / 2 : 0, '100%'],
          stillShowZeroSum: false,
          showEmptyCircle: false,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: false },
          data: seriesData,
        },
      ],
    }),
    [theme, formatValue, seriesData, centerWidth, hasCenter],
  )

  return (
    <Stack direction="row" sx={{ height: height ?? '100%', flexGrow: 1, minWidth: 0, gap: Spacing.xs }}>
      <Box
        ref={containerRef}
        role="img"
        aria-label={data.map(({ name, value }) => `${name}: ${formatValue(value)}`).join(', ')}
        data-testid={testId}
        sx={{ position: 'relative', flexGrow: 1, minWidth: 0 }}
      >
        <ReactECharts
          option={option}
          notMerge
          autoResize={false}
          style={{ position: 'absolute', inset: 0, width: width || '100%', height: chartHeight || '100%' }}
        />
        {children && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <Box ref={centerRef} sx={{ padding: Spacing.lg }}>
              <Box sx={{ width: IconSize[centerSize], height: IconSize[centerSize] }}>{children}</Box>
            </Box>
          </Box>
        )}
      </Box>
      <Stack
        component="ul"
        data-testid={`${testId}-legend`}
        sx={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          gap: Spacing.xxs,
          maxWidth: Width.column.sm,
          alignSelf: 'end',
          flexShrink: 0,
        }}
      >
        {seriesData.map(({ id, name, value, itemStyle }) => (
          <Stack
            component="li"
            key={id}
            direction="row"
            sx={{ alignItems: 'center', gap: Spacing.xxs }}
            title={`${name}: ${formatValue(value)}`}
          >
            <Box sx={{ width: IconSize.xs, height: IconSize.xs, flexShrink: 0, backgroundColor: itemStyle.color }} />
            <Typography variant="bodyXsRegular" color="textSecondary" sx={{ overflowWrap: 'anywhere' }}>
              {name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
