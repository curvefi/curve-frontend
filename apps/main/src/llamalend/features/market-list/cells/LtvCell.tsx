import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { formatPercent } from '@/llamalend/format.utils'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { LlamaMarketColumnId } from '../columns.enum'

export const LtvCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { data, error, isLoading } = useUserMarketStats(row.original, LlamaMarketColumnId.UserLtv)

  if (isLoading) {
    return <Skeleton variant="text" width={40} />
  }

  if (!data?.ltv || error) {
    return (
      <Typography variant="tableCellMBold" color="textSecondary" textAlign="right">
        —
      </Typography>
    )
  }

  return (
    <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
      {formatPercent(data.ltv)}
    </Typography>
  )
}
