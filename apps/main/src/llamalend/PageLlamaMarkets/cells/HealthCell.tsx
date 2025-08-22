import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { getHealthValueColor } from '@ui-kit/features/market-position-details/utils'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const HealthCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const { data, error } = useUserMarketStats(row.original, LlamaMarketColumnId.UserHealth)
  const { health } = data ?? {}
  return health == null ? (
    error && <ErrorCell error={error} />
  ) : (
    <Stack gap={Spacing.xs}>
      {health.toFixed(2)}
      <LinearProgress percent={health} size="medium" barColor={(t) => getHealthValueColor(health, t)} />
    </Stack>
  )
}
