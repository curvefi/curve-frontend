import { useCallback } from 'react'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatDate, formatTime } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { ClickableInRowClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'
import { HistoryTableCell } from './HistoryTableCell'

const { Spacing } = SizesAndSpaces

export const TimestampCell = ({
  row: {
    original: { timestamp, txUrl },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => {
  const isMobile = useIsMobile()
  const handleClick = useCallback(() => {
    // On mobile, don't handle click to allow row expansion
    if (!isMobile && txUrl) {
      window.open(txUrl, '_blank')
    }
  }, [txUrl, isMobile])

  return (
    <HistoryTableCell onClick={isMobile ? undefined : handleClick} sx={{ gap: Spacing.xxs }}>
      <Typography variant="tableCellMBold">{formatDate(timestamp, 'short')}</Typography>
      <Stack direction="row" alignItems="center" justifyContent="end" gap={Spacing.xs}>
        <Typography variant="bodySBold" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {formatTime(timestamp)}
        </Typography>
        {!isMobile && (
          <ArrowOutwardIcon
            className={ClickableInRowClass}
            sx={{ fontSize: 20, color: (t) => t.design.Text.TextColors.Secondary }}
          />
        )}
      </Stack>
    </HistoryTableCell>
  )
}
