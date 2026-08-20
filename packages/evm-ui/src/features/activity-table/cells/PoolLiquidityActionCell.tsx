import type { PoolLiquidityEventType } from '@curvefi/prices-api/pools'
import { t } from '@evm-ui/lib/i18n'
import { DownloadIcon } from '@evm-ui/shared/icons/DownloadIcon'
import { UploadIcon } from '@evm-ui/shared/icons/UploadIcon'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { PoolLiquidityRow } from '../types'

const { Spacing } = SizesAndSpaces

type PoolLiquidityActionCellProps = {
  event: PoolLiquidityRow
}

const isAddLiquidity = (eventType: PoolLiquidityEventType): boolean => eventType === 'AddLiquidity'

export const PoolLiquidityActionCell = ({ event }: PoolLiquidityActionCellProps) => {
  const isAdd = isAddLiquidity(event.eventType)
  const label = isAdd ? t`Add` : t`Remove`
  const Icon = isAdd ? DownloadIcon : UploadIcon

  return (
    <InlineTableCell>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <Icon />
        <Typography variant="tableCellMBold" color={isAdd ? 'success' : 'error'}>
          {label}
        </Typography>
      </Stack>
    </InlineTableCell>
  )
}
