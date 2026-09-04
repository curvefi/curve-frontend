import { TABLE_SECONDARY_TEXT_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatDate, formatTime } from '@legacy-ui/utils'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'

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
      sx={{ gap: Spacing.xxs, whiteSpace: 'nowrap' }}
    >
      <Typography variant="tableCellMBold" sx={{ textAlign: align }}>
        {formatDate(timestamp, 'short', { omitYear: isMobile })}
      </Typography>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: align,
          gap: Spacing.xs,
        }}
      >
        <Typography variant="tableCellSRegular" className={TABLE_SECONDARY_TEXT_CLASS}>
          {formatTime(timestamp, { precise: !isMobile })}
        </Typography>
        {clickable && <ArrowOutwardIcon className={TABLE_SECONDARY_TEXT_CLASS} sx={{ flexShrink: 0, fontSize: 20 }} />}
      </Stack>
    </InlineTableCell>
  )
}
