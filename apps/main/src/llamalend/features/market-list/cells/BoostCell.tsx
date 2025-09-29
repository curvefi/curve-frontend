import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns.enum'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui-kit/utils'

export const BoostCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const market = row.original
  const { data: stats, isLoading } = useUserMarketStats(market, LlamaMarketColumnId.UserBoostMultiplier)
  const boostMultiplier = stats?.earnings?.boostMultiplier

  if (isLoading) {
    return <Skeleton variant="text" width={40} />
  }

  if (!boostMultiplier || boostMultiplier <= 1) {
    return (
      <Typography variant="tableCellMBold" color="textSecondary" textAlign="right">
        —
      </Typography>
    )
  }

  return (
    <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
      {formatNumber(boostMultiplier, { maximumFractionDigits: 2, abbreviate: false })}x
    </Typography>
  )
}
