import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { Box } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatPercent } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'

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
