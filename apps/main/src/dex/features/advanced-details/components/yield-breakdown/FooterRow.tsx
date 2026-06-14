import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const FooterRow = ({ baseTotal, total }: { baseTotal: number | undefined; total: number | undefined }) => (
  <>
    {/** Source */}
    <TableCell sx={{ paddingInline: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`Total APY`}</Typography>
    </TableCell>

    {/** Price */}
    {!useIsMobile() && <TableCell />}

    {/** APY */}
    <TableCell sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
      {maybe(baseTotal, x => (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {t`Base ${formatNumber(x, 'percent.rate')}`}
        </Typography>
      ))}
    </TableCell>
  </>
)
