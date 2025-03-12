import { Line, LineChart, YAxis } from 'recharts'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { DesignSystem } from '@ui-kit/themes/design'
import { GraphType, useSnapshots } from '../hooks/useSnapshots'

const graphSize = { width: 172, height: 48 }

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
  type: GraphType
}

/**
 * Line graph cell that displays the average historical APY for a vault and a given type (borrow or lend).
 */
export const LineGraphCell = ({ market, type }: RateCellProps) => {
  const { snapshots, snapshotKey, isLoading, rate } = useSnapshots(market, type)
  const { design } = useTheme()
  return (
    rate != null && (
      <Box data-testid={`line-graph-${type}`}>
        {snapshots?.length ? (
          <LineChart data={snapshots} {...graphSize} compact>
            <YAxis hide type="number" domain={calculateDomain(snapshots[0][snapshotKey] as number)} />
            <Line
              type="monotone"
              dataKey={snapshotKey}
              stroke={getColor(design, snapshots, snapshotKey)}
              strokeWidth={1}
              dot={false}
            />
          </LineChart>
        ) : isLoading ? (
          <Skeleton {...graphSize} />
        ) : (
          <Typography sx={{ ...graphSize, alignContent: 'center', textAlign: 'left' }} variant="bodyXsBold">
            {t`No historical data`}
          </Typography>
        )}
      </Box>
    )
  )
}
