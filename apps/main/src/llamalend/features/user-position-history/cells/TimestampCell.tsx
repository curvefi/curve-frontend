import { useCallback } from 'react'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatDate, formatTime } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

export const TimestampCell = ({
  row: {
    original: { timestamp, txUrl },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => {
  const handleClick = useCallback(() => {
    window.open(txUrl, '_blank')
  }, [txUrl])

  return (
    <Stack
      height={Spacing.xl}
      paddingY={Spacing.xxs}
      paddingX={Spacing.sm}
      onClick={handleClick}
      sx={{ cursor: 'pointer' }}
    >
      <Typography variant="tableCellMBold">{formatDate(timestamp, 'short')}</Typography>
      <Stack direction="row" alignItems="center" justifyContent="end" gap={Spacing.xs}>
        <Typography variant="bodySBold" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {formatTime(timestamp)}
        </Typography>
        <ArrowOutwardIcon sx={{ fontSize: 20, color: (t) => t.design.Text.TextColors.Secondary }} />
      </Stack>
    </Stack>
  )
}
