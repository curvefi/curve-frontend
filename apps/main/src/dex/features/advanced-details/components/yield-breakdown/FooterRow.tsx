import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const FooterRow = ({
  dailyBaseTotal,
  dailyTotal,
}: {
  dailyBaseTotal: number | undefined
  dailyTotal: number | undefined
}) => (
  <>
    {/** Source */}
    <TableCell sx={{ paddingInline: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`Total APY`}</Typography>
    </TableCell>

    {/** Address */}
    <TableCell />

    {/** Daily APR */}
    <TableCell
      sx={{
        paddingInline: Spacing.md,
        paddingBlock: Spacing.sm,
        textAlign: 'right',
      }}
    >
      <Typography variant="tableCellMBold">{formatNumber(dailyTotal, 'percent.rate')}</Typography>
      {maybe(dailyBaseTotal, x => (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {t`Base ${formatNumber(x, 'percent.rate')}`}
        </Typography>
      ))}
    </TableCell>
  </>
)
