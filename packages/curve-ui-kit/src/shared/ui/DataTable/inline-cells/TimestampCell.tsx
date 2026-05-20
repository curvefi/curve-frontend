import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate, formatTime } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type TimestampCellProps = {
  timestamp: Date
  txUrl?: string | null
  align?: 'start' | 'end'
}

/**
 * Cell component for displaying timestamps with optional transaction link.
 */
export const TimestampCell = ({ timestamp, txUrl, align = 'start' }: TimestampCellProps) => {
  const isMobile = useIsMobile()
  const clickable = !isMobile && txUrl // on mobile we use row expansion

  return (
    <InlineTableCell
      {...(clickable && {
        onClick: () => {
          window.open(txUrl, '_blank')
        },
      })}
      sx={{ gap: Spacing.xxs }}
    >
      <Typography variant="tableCellMBold" textAlign={align}>
        {formatDate(timestamp, 'short')}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent={align} gap={Spacing.xs}>
        <Typography variant="tableCellSRegular" color="textSecondary">
          {formatTime(timestamp)}
        </Typography>
        {clickable && <ArrowOutwardIcon sx={{ fontSize: 20, color: t => t.design.Text.TextColors.Secondary }} />}
      </Stack>
    </InlineTableCell>
  )
}
