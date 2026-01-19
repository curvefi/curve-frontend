import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { DownloadIcon } from '@ui-kit/shared/icons/DownloadIcon'
import { UploadIcon } from '@ui-kit/shared/icons/UploadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlammaEventRow } from '../types'
import { ActivityTableCell } from './ActivityTableCell'

const { Spacing } = SizesAndSpaces

type LlammaEventActionCellProps = {
  event: LlammaEventRow
}

export const LlammaEventActionCell = ({ event }: LlammaEventActionCellProps) => {
  const isDeposit = !!event.deposit
  const label = isDeposit ? t`Deposit` : t`Withdrawal`
  const Icon = isDeposit ? DownloadIcon : UploadIcon

  return (
    <ActivityTableCell>
      <Stack direction="row" alignItems="center" gap={Spacing.sm}>
        <Icon />
        <Typography variant="tableCellMBold" color={isDeposit ? 'success' : 'error'}>{label}</Typography>
      </Stack>
    </ActivityTableCell>
  )
}
