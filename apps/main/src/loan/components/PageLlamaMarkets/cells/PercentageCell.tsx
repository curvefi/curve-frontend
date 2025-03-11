import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { CellContext } from '@tanstack/react-table'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PercentageCell = ({ getValue, column, row }: CellContext<LlamaMarket, number>) => {
  const { data: stats, error: statsError } = useUserMarketStats(row.original, column.id as LlamaMarketColumnId)
  const value = column.id === LlamaMarketColumnId.UserHealth ? stats?.health : getValue()
  if (value == null || (value === 0 && column.columnDef.meta?.hideZero)) {
    if (statsError) {
      return (
        <Tooltip title={statsError.toString()}>
          <Box>?</Box>
        </Tooltip>
      )
    }
    return '-'
  }
  return (
    <Stack gap={Spacing.xs}>
      {value.toFixed(2) + '%'}
      <LinearProgress percent={value} size="medium" />
    </Stack>
  )
}
