import { t } from '@evm-ui/lib/i18n'
import { DownloadIcon } from '@evm-ui/shared/icons/DownloadIcon'
import { UploadIcon } from '@evm-ui/shared/icons/UploadIcon'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
