import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { getUserPositionsSummary } from './user-position.utils'

const { Spacing } = SizesAndSpaces

export const UserPositionSummary = ({ markets }: { markets: LlamaMarketRow[] | undefined }) => {
  const summary = getUserPositionsSummary(markets)
  return (
    <MetricsGrid
      variant="fillMobile"
      sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
    >
      {summary.map(item => (
        <Metric
          key={item.label}
          value={item.metric}
          category="llamalend.marketListSummary"
          valueOptions={{ unit: 'dollar' }}
          label={item.label}
        />
      ))}
    </MetricsGrid>
  )
}
