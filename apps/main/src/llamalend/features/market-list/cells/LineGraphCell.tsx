import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo, useRef } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { useIntersectionObserver } from '@ui-kit/hooks/useIntersectionObserver'
import { t } from '@ui-kit/lib/i18n'
import { DesignSystem } from '@ui-kit/themes/design'
import type { MarketRateType } from '@ui-kit/types/market'
import { useSnapshots } from '../hooks/useSnapshots'

const defaultGraphSize = { width: 100, height: 48 }

/**
 * Get the color for the line graph. Will be green if the last value is higher than the first, red if lower, and blue if equal.
 */
function getColor<T>(design: DesignSystem, data: T[], snapshotKey: keyof T) {
  if (!data.length) return undefined
  const first = data[0][snapshotKey]
  const last = data[data.length - 1][snapshotKey]
  return design.Layer.Feedback[last === first ? 'Info' : last < first ? 'Error' : 'Success']
}

/** Center the y-axis around the first value */
const calculateDomain = <T extends Record<string, unknown>>(data: T[], snapshotKey: keyof T): [number, number] => {
  const first = Number(data[0][snapshotKey])
  const values = data.map(snapshot => Number(snapshot[snapshotKey]))
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const diff = Math.max(dataMax - first, first - dataMin)
  return [first - diff, first + diff]
}

type RateCellProps = {
  market: LlamaMarket
  type: MarketRateType
  graphSize?: typeof defaultGraphSize
}

/**
 * Line graph cell that displays the average historical rate for a vault and a given type (borrow APR or lend APR).
 */
export const LineGraphCell = ({ market, type, graphSize = defaultGraphSize }: RateCellProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { isIntersecting } = useIntersectionObserver(ref, { freezeOnceVisible: true })
  const { snapshots, snapshotKey, isLoading, rate, error } = useSnapshots(
    market,
    { type, category: 'llamalend.marketList.rate' },
    isIntersecting,
  )
  const { design } = useTheme()
  const lineColor = getColor(design, snapshots ?? [], snapshotKey)
  const chartOption: EChartsOption | null = useMemo(() => {
    if (!snapshots?.length) return null

    const [min, max] = calculateDomain(snapshots, snapshotKey)

    return {
      animation: false,
      grid: { left: 0, top: 0, right: 0, bottom: 0 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: snapshots.map((_, index) => index),
      },
      yAxis: {
        type: 'value',
        show: false,
        min,
        max,
      },
      series: [
        {
          type: 'line',
          data: snapshots.map(snapshot => Number(snapshot[snapshotKey])),
          showSymbol: false,
          smooth: true,
          silent: true,
          lineStyle: {
            color: lineColor,
            width: 1,
          },
        },
      ],
    }
  }, [lineColor, snapshotKey, snapshots])

  // supply yield disabled for mint markets
  return maybe(rate, () => (
    <Box data-testid={`line-graph-${type}`} ref={ref}>
      {chartOption ? (
        <ReactECharts
          option={chartOption}
          notMerge
          opts={{ renderer: 'svg' }}
          style={{ width: graphSize.width, height: graphSize.height }}
        />
      ) : isLoading && !error ? (
        <Skeleton {...graphSize} />
      ) : (
        <Typography
          sx={{ ...graphSize, alignContent: 'center', textAlign: 'left' }}
          variant="bodyXsBold"
          title={error?.toString()}
        >
          {error ? t`Failed to load` : t`No historical data`}
        </Typography>
      )}
    </Box>
  ))
}
