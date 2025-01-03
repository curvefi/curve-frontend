import { LendingSnapshot, useLendingSnapshots } from '@/entities/lending'
import { LendingVault } from '@/entities/vaults'
import { Line, LineChart } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'

const graphSize = { width: 172, height: 48 }

type GraphType = 'borrow' | 'lend'

function getColor(design: DesignSystem, data: LendingSnapshot[], type: GraphType) {
  if (!data.length) return undefined
  const first = data[0][`${type}_apy`]
  const last = data[data.length - 1][`${type}_apy`]
  return design.Text.TextColors[last === first ? 'Info' : last < first ? 'Error' : 'Success']
}

export const LineGraphCell = ({ vault, type }: { vault: LendingVault; type: GraphType }) => {
  const { data: snapshots, isLoading } = useLendingSnapshots({
    blockchainId: vault.blockchainId,
    contractAddress: vault.controllerAddress,
  })
  const { design } = useTheme()
  const value = vault.rates[`${type}ApyPcent`]
  if (value == null) {
    return '-'
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="end" gap={3} data-testid={`line-graph-cell-${type}`}>
      {value.toPrecision(4)}%
      {snapshots?.length ? (
        <LineChart data={snapshots} {...graphSize}>
          <Line
            type="monotone"
            dataKey={`${type}_apy`}
            stroke={getColor(design, snapshots, type)}
            strokeWidth={1}
            dot={<></>}
          />
        </LineChart>
      ) : isLoading ? (
        <Skeleton {...graphSize} />
      ) : (
        <Box sx={graphSize} />
      )}
    </Stack>
  )
}
