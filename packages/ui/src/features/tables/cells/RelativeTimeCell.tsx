import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { Tooltip } from '@ui/components/Tooltip'
import { CLICKABLE_IN_ROW_CLASS } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import { relativeTime } from '@ui/lib/time'

export const RelativeTimeCell = ({ timestamp, txUrl }: { timestamp: Date; txUrl?: string | null }) => (
  <InlineTableCell sx={{ whiteSpace: 'nowrap' }}>
    <Tooltip
      title={formatDate(timestamp, 'long')}
      body={txUrl && <ExternalLink href={txUrl} label={t`View on explorer`} />}
      placement="top"
      clickable={!!txUrl}
      describeChild
    >
      <Typography
        variant="tableCellValue"
        className={!useIsMobile() && txUrl ? CLICKABLE_IN_ROW_CLASS : undefined}
        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
      >
        {relativeTime(useCurrentDate().getTime(), timestamp.getTime(), 'short')}
      </Typography>
    </Tooltip>
  </InlineTableCell>
)
