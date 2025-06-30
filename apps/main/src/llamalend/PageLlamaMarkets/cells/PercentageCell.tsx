import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const PercentageCell = ({ getValue, column, row }: CellContext<LlamaMarket, number>) => {
  const { data: stats, error: statsError } = useUserMarketStats(row.original, column.id as LlamaMarketColumnId)
  const value = column.id === LlamaMarketColumnId.UserHealth ? stats?.health : getValue()
  if (value == null || (value === 0 && column.columnDef.meta?.hideZero)) {
    return statsError && <ErrorCell error={statsError} />
  }
  return (
    <Stack gap={Spacing.xs}>
      {value.toFixed(2) + '%'}
      <LinearProgress percent={value} size="medium" />
    </Stack>
  )
}
