import type { PoolLiquidityEventType } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { DownloadIcon } from '@ui-kit/shared/icons/DownloadIcon'
import { UploadIcon } from '@ui-kit/shared/icons/UploadIcon'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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
      <Stack direction="row" alignItems="center" gap={Spacing.sm}>
        <Icon />
        <Typography variant="tableCellMBold" color={isAdd ? 'success' : 'error'}>
          {label}
        </Typography>
      </Stack>
    </InlineTableCell>
  )
}
