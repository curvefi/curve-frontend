import { useRef } from 'react'
import { Line, LineChart, YAxis } from 'recharts'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
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
const calculateDomain =
  (first: number) =>
  ([dataMin, dataMax]: [number, number]): [number, number] => {
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
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  const { snapshots, snapshotKey, isLoading, rate, error } = useSnapshots(market, type, entry?.isIntersecting)
  const { design } = useTheme()
  if (rate == null) return null // supply yield disabled for mint markets
  return (
    <Box data-testid={`line-graph-${type}`} ref={ref}>
      {snapshots?.length ? (
        <LineChart data={snapshots} {...graphSize} compact>
          <YAxis hide type="number" domain={calculateDomain(snapshots[0][snapshotKey] as number)} />
          <Line
            type="monotone"
            dataKey={snapshotKey}
            stroke={getColor(design, snapshots, snapshotKey)}
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
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
  )
}
