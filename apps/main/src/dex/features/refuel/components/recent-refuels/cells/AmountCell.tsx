import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type AmountCellProps = {
  amount?: number | null
  usdAmount?: number | null
}

export const AmountCell = ({ amount, usdAmount }: AmountCellProps) => {
  const formattedUsd = formatNumber(usdAmount, { unit: 'dollar', abbreviate: false })

  return (
    <Stack alignItems="end" gap={Spacing.xxs}>
      <Typography variant="tableCellMRegular">{formatNumber(amount, { abbreviate: false, fallback: '-' })}</Typography>
      {formattedUsd && (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {formattedUsd}
        </Typography>
      )}
    </Stack>
  )
}
