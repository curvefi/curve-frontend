import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatUsd } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const YieldBasisPoolsFooterRow = ({
  volume24h,
  volume7d,
  colSpan,
}: {
  volume24h?: number
  volume7d?: number
  colSpan: number
}) => (
  <TableCell colSpan={colSpan} sx={{ borderBottom: 'none', padding: Spacing.md }}>
    <Stack direction="row" gap={Spacing.md} flexWrap="wrap">
      <Typography variant="bodyXsRegular" color="textSecondary">
        {t`24h volume`}: {volume24h == null ? t`N/A` : formatUsd(volume24h)}
      </Typography>
      <Typography variant="bodyXsRegular" color="textSecondary">
        {t`7d volume`}: {volume7d == null ? t`N/A` : formatUsd(volume7d)}
      </Typography>
    </Stack>
  </TableCell>
)
