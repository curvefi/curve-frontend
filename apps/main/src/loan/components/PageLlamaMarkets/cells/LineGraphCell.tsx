import { LendingSnapshot, useLendingSnapshots } from '@loan/entities/lending-snapshots'
import { Line, LineChart, YAxis } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { meanBy } from 'lodash'
import Box from '@mui/material/Box'
import { LlamaMarket, LlamaMarketType } from '@loan/entities/llama-markets'

const graphSize = { width: 172, height: 48 }

type GraphType = 'borrow' | 'lend'

/**
 * Get the color for the line graph. Will be green if the last value is higher than the first, red if lower, and blue if equal.
 */
function getColor(design: DesignSystem, data: LendingSnapshot[], type: GraphType) {
  if (!data.length) return undefined
  const first = data[0][`${type}_apy`]
  const last = data[data.length - 1][`${type}_apy`]
  return design.Layer.Feedback[last === first ? 'Info' : last < first ? 'Error' : 'Success']
}

/** Center the y-axis around the first value */
const calculateDomain =
  (first: number) =>
  ([dataMin, dataMax]: [number, number]): [number, number] => {
    const diff = Math.max(dataMax - first, first - dataMin)
    return [first - diff, first + diff]
  }

/**
 * Line graph cell that displays the average historical APY for a vault and a given type (borrow or lend).
 */
export const LineGraphCell = ({
  market,
  type,
  showChart,
}: {
  market: LlamaMarket
  type: GraphType
  showChart: boolean // chart is hidden depending on the chart settings
}) => {
  const { data: snapshots, isLoading } = useLendingSnapshots(
    {
      blockchainId: market.blockchainId,
      contractAddress: market.controllerAddress,
    },
    market.type == LlamaMarketType.Pool,
  )
  const { design } = useTheme()
  const currentValue = market.rates[type]
  const snapshotKey = `${type}_apy` as const

  const rate = useMemo(
    () => (snapshots?.length ? meanBy(snapshots, (row) => row[snapshotKey]) : currentValue),
    [snapshots, currentValue, snapshotKey],
  )
  if (rate == null) {
    return '-'
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="end" gap={3} data-testid={`line-graph-cell-${type}`}>
      {rate.toPrecision(4)}%
      {showChart && (
        <Box data-testid={`line-graph-${type}`}>
          {snapshots?.length ? (
            <LineChart data={snapshots} {...graphSize} compact>
              <YAxis hide type="number" domain={calculateDomain(snapshots[0][snapshotKey])} />
              <Line
                type="monotone"
                dataKey={snapshotKey}
                stroke={getColor(design, snapshots, type)}
                strokeWidth={1}
                dot={<></>}
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
      )}
    </Stack>
  )
}
