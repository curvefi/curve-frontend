import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { Tooltip } from '@ui/components/Tooltip'
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
      <Typography variant="tableCellValue" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
        {relativeTime(useCurrentDate().getTime(), timestamp.getTime(), 'short')}
      </Typography>
    </Tooltip>
  </InlineTableCell>
)
