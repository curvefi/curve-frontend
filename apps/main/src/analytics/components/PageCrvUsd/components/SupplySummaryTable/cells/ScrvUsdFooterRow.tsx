import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { SupplyValueDisplay } from './ValueCell'

const { Spacing } = SizesAndSpaces

const footerCellSx = { borderBottom: 'none', padding: Spacing.md }

export const ScrvUsdFooterRow = ({ value, loading }: { value: number | undefined; loading: boolean }) => (
  <>
    <TableCell sx={footerCellSx}>
      <Typography variant="bodySRegular" color="textSecondary">
        {t`scrvUSD Absorbed`}
      </Typography>
    </TableCell>
    <TableCell sx={footerCellSx} align="right">
      <WithSkeleton loading={loading}>
        <SupplyValueDisplay value={value} />
      </WithSkeleton>
    </TableCell>
  </>
)
