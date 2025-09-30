import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns.enum'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'

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

  if (!boostMultiplier || boostMultiplier <= 1) {
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
