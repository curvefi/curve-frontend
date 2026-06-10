import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const FooterRow = ({ isLoading, totalUsd }: { isLoading: boolean; totalUsd: string | undefined }) => (
  <>
    {/** Asset */}
    <TableCell sx={{ padding: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`USD Total`}</Typography>
    </TableCell>

    {/** Price */}
    <TableCell />

    {/** % of Market */}
    <TableCell sx={{ paddingInline: Spacing.sm, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">100%</Typography>
    </TableCell>

    {/** Amount */}
    <TableCell sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <WithSkeleton loading={isLoading} sx={{ justifySelf: 'end' }}>
        <Typography variant="tableCellMBold">{formatNumber(amount(totalUsd), 'usd.notional')}</Typography>
      </WithSkeleton>
    </TableCell>
  </>
)
