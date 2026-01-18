import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { ClickableInRowClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatDate, formatTime } from '@ui-kit/utils'
import { ActivityTableCell } from './ActivityTableCell'

const { Spacing } = SizesAndSpaces

type TimestampCellProps = {
  timestamp: Date
  txUrl?: string
}

/**
 * Cell component for displaying timestamps with optional transaction link.
 * On desktop, clicking opens the transaction in a new tab.
 * On mobile, the link is typically shown in an expanded row instead.
 */
export const TimestampCell = ({ timestamp, txUrl }: TimestampCellProps) => {
  const isMobile = useIsMobile()
  const clickable = !isMobile && txUrl

  return (
    <ActivityTableCell {...(clickable && { onClick: () => window.open(txUrl, '_blank') })} sx={{ gap: Spacing.xxs }}>
      <Typography variant="tableCellMBold">{formatDate(timestamp, 'short')}</Typography>
      <Stack direction="row" alignItems="center" justifyContent="end" gap={Spacing.xs}>
        <Typography variant="bodySBold" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {formatTime(timestamp)}
        </Typography>
        {clickable && (
          <ArrowOutwardIcon
            className={ClickableInRowClass}
            sx={{ fontSize: 20, color: (t) => t.design.Text.TextColors.Secondary }}
          />
        )}
      </Stack>
    </ActivityTableCell>
  )
}
