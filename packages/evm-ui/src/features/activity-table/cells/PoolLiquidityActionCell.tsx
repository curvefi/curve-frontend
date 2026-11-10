import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { DownloadIcon } from '@ui/icons/DownloadIcon'
import { UploadIcon } from '@ui/icons/UploadIcon'
import type { PoolLiquidityRow } from '../types'
import { getPoolLiquidityEventAction } from '../utils'

const { Spacing } = SizesAndSpaces

type PoolLiquidityActionCellProps = { event: PoolLiquidityRow }

export const PoolLiquidityActionCell = ({ event }: PoolLiquidityActionCellProps) => {
  const { label, color } = getPoolLiquidityEventAction(event)
  const Icon = event.eventType === 'AddLiquidity' ? DownloadIcon : UploadIcon

  return (
    <InlineTableCell>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <Icon />
        <Typography variant="tableCellValue" color={color}>
          {label}
        </Typography>
      </Stack>
    </InlineTableCell>
  )
}
