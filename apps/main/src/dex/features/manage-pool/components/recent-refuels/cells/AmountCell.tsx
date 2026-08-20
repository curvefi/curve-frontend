import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatNumber } from '@evm-ui/utils'

const { Spacing } = SizesAndSpaces

type AmountCellProps = {
  amount: number | null | undefined
  usdAmount: number | null | undefined
}

export const AmountCell = ({ amount, usdAmount }: AmountCellProps) => {
  const formattedUsd = formatNumber(usdAmount, 'usd.amount')

  return (
    <Stack sx={{ gap: Spacing.xxs, alignItems: 'end' }}>
      <Typography variant="tableCellMRegular">{formatNumber(amount, { abbreviate: false, fallback: '-' })}</Typography>
      {formattedUsd && (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {formattedUsd}
        </Typography>
      )}
    </Stack>
  )
}
