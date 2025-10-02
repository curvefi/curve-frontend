import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { formatPercent } from '@/llamalend/format.utils'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { Box } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { LlamaMarketColumnId } from '../columns.enum'

export const LtvCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { data, error, isLoading } = useUserMarketStats(row.original, LlamaMarketColumnId.UserLtv)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="end">
        <Typography variant="tableCellMBold" textAlign="right">
          <Skeleton variant="text" width={40} />
        </Typography>
      </Box>
    )
  }

  if (!data?.ltv || error) {
    return (
      <Typography variant="tableCellMBold" color="textSecondary" textAlign="right">
        -
      </Typography>
    )
  }

  return (
    <Tooltip
      clickable
      title={t`LTV`}
      body={<CurrentLTVTooltipContent debtDenomination={'Borrowed amount'} />}
      placement="top"
    >
      <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
        {formatPercent(data.ltv)}
      </Typography>
    </Tooltip>
  )
}
