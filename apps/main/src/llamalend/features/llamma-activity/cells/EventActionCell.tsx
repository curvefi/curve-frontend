import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ActivityTableCell } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { DownloadIcon } from '@ui-kit/shared/icons/DownloadIcon'
import { UploadIcon } from '@ui-kit/shared/icons/UploadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { EventRow } from '../hooks/useLlammaActivity'

const { Spacing } = SizesAndSpaces

type EventActionCellProps = {
  event: EventRow
}

export const EventActionCell = ({ event }: EventActionCellProps) => {
  const isDeposit = !!event.deposit
  const label = isDeposit ? t`Deposit` : t`Withdrawal`
  const Icon = isDeposit ? DownloadIcon : UploadIcon

  return (
    <ActivityTableCell>
      <Stack direction="row" alignItems="center" gap={Spacing.sm}>
        <Icon />
        <Typography variant="tableCellMBold">{label}</Typography>
      </Stack>
    </ActivityTableCell>
  )
}
