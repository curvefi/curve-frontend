import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { TABLE_SECONDARY_TEXT_CLASS } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { ArrowTopRightIcon } from '@ui/icons/ArrowTopRightIcon'
import { relativeTime } from '@ui/lib/time'

const { Spacing } = SizesAndSpaces

export const RelativeTimeCell = ({ timestamp, txUrl }: { timestamp: Date; txUrl?: string | null }) => {
  const now = useCurrentDate()
  const isMobile = useIsMobile()
  const clickable = !isMobile && txUrl // on mobile we use row expansion

  return (
    <InlineTableCell
      {...(clickable && {
        onClick: () => {
          window.open(txUrl, '_blank')
        },
      })}
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'start',
        gap: Spacing.xxs,
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        variant="tableCellValue"
        component="time"
        dateTime={timestamp.toISOString()}
        title={formatDate(timestamp, 'long')}
      >
        {relativeTime(now.getTime(), timestamp.getTime(), 'short')}
      </Typography>
      {txUrl && <ArrowTopRightIcon className={TABLE_SECONDARY_TEXT_CLASS} sx={{ flexShrink: 0, fontSize: 20 }} />}
    </InlineTableCell>
  )
}
