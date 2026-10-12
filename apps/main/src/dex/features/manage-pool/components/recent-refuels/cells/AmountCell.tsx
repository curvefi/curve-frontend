import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AmountCellProps = { amount: number | Nullish; usdAmount: number | Nullish }

export const AmountCell = ({ amount, usdAmount }: AmountCellProps) => {
  const formattedUsd = formatNumber(usdAmount, 'usd.amount')

  return (
    <Stack sx={{ gap: Spacing.xxs, alignItems: 'end' }}>
      <Typography variant="tableCellValue">{formatNumber(amount, { abbreviate: false, fallback: '-' })}</Typography>
      {formattedUsd && (
        <Typography variant="tableCellSupport" color="textSecondary">
          {formattedUsd}
        </Typography>
      )}
    </Stack>
  )
}
