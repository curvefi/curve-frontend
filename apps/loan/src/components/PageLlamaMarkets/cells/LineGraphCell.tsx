import { LendingSnapshot, useLendingSnapshots } from '@/entities/lending'
import { LendingVault } from '@/entities/vaults'
import { Line, LineChart } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { meanBy } from 'lodash'

const graphSize = { width: 172, height: 48 }

type GraphType = 'borrow' | 'lend'

function getColor(design: DesignSystem, data: LendingSnapshot[], type: GraphType) {
  if (!data.length) return undefined
  const first = data[0][`${type}_apy`]
  const last = data[data.length - 1][`${type}_apy`]
  return design.Text.TextColors[last === first ? 'Info' : last < first ? 'Error' : 'Success']
}

export const LineGraphCell = ({
  vault,
  type,
  showChart,
}: {
  vault: LendingVault
  type: GraphType
  showChart: boolean
}) => {
  const { data: snapshots, isLoading } = useLendingSnapshots({
    blockchainId: vault.blockchainId,
    contractAddress: vault.controllerAddress,
  })
  const { design } = useTheme()
  const currentValue = vault.rates[`${type}ApyPcent`]
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
      {showChart && snapshots?.length ? (
        <LineChart data={snapshots} {...graphSize}>
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
        showChart && (
          <Typography sx={{ ...graphSize, alignContent: 'center' }} variant="bodyXsBold">
            {t`No historical data`}
          </Typography>
        )
      )}
    </Stack>
  )
}
