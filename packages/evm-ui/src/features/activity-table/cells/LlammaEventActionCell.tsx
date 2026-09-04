import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { DownloadIcon } from '@ui/icons/DownloadIcon'
import { UploadIcon } from '@ui/icons/UploadIcon'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'

const { Spacing } = SizesAndSpaces

type LlammaEventActionCellProps = {
  event: MarketEventRow
}

export const LlammaEventActionCell = ({ event }: LlammaEventActionCellProps) => {
  const isDeposit = !!event.deposit
  const label = isDeposit ? t`Deposit` : t`Withdrawal`
  const Icon = isDeposit ? DownloadIcon : UploadIcon

  return (
    <InlineTableCell>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <Icon />
        <Typography variant="tableCellMBold" color={isDeposit ? 'success' : 'error'}>
          {label}
        </Typography>
      </Stack>
    </InlineTableCell>
  )
}
