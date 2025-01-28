import { LendingSnapshot, useLendingSnapshots } from '@/loan/entities/lending-snapshots'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
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
import { useCrvUsdSnapshots } from '@/loan/entities/crvusd'

const graphSize = { width: 172, height: 48 }

type GraphType = 'borrow' | 'lend'

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

type LineGraphCellProps = {
  market: LlamaMarket
  type: GraphType
  showChart: boolean // chart is hidden depending on the chart settings
}

function useSnapshots({ address, blockchainId, controllerAddress, type: marketType }: LlamaMarket, type: GraphType) {
  const isPool = marketType == LlamaMarketType.Pool
  const showMintGraph = !isPool && type === 'borrow'
  const contractAddress = isPool ? controllerAddress : address
  const params = { blockchainId: blockchainId, contractAddress }
  const { data: poolSnapshots, isLoading: poolIsLoading } = useLendingSnapshots(params, isPool)
  const { data: mintSnapshots, isLoading: mintIsLoading } = useCrvUsdSnapshots(params, showMintGraph)
  if (isPool) {
    return { snapshots: poolSnapshots, isLoading: poolIsLoading, snapshotKey: `${type}_apy` as const }
  }
  return { snapshots: showMintGraph ? mintSnapshots : null, isLoading: mintIsLoading, snapshotKey: 'rate' as const }
}

/**
 * Line graph cell that displays the average historical APY for a vault and a given type (borrow or lend).
 */
export const LineGraphCell = ({ market, type, showChart }: LineGraphCellProps) => {
  const { snapshots, snapshotKey, isLoading } = useSnapshots(market, type)
  const currentValue = market.rates[type]
  const rate = useMemo(
    () => (snapshots?.length ? meanBy(snapshots, (row) => row[snapshotKey]) : currentValue),
    [snapshots, currentValue, snapshotKey],
  )
  const { design } = useTheme()
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
                stroke={getColor(design, snapshots, snapshotKey)}
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
