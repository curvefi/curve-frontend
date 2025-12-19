import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'

export const BoostCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { data: stats, isLoading } = useUserMarketStats(market, LlamaMarketColumnId.UserBoostMultiplier)
  const boostMultiplier = stats?.earnings?.boostMultiplier

  if (isLoading) {
    return (
      <Typography variant="tableCellMBold" textAlign="right">
        <Skeleton variant="text" width={40} />
      </Typography>
    )
  }

  if (!boostMultiplier) {
    return (
      <Typography variant="tableCellMBold" color="textSecondary" textAlign="right">
        -
      </Typography>
    )
  }

  return (
    <Tooltip clickable title={t`Boost`} body={<BoostTooltipContent />} placement="top">
      <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
        {formatNumber(boostMultiplier, { maximumFractionDigits: 2, abbreviate: false })}x
      </Typography>
    </Tooltip>
  )
}
