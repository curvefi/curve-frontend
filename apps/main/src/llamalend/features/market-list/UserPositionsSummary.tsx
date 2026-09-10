import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { parseListFilter } from '@evm-ui/shared/ui/DataTable/filters'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { getUserPositionsSummary } from './user-position.utils'

const { Spacing } = SizesAndSpaces

export const UserPositionSummary = ({
  markets,
  selectedChains,
}: {
  markets: LlamaMarketRow[] | undefined
  selectedChains: string | undefined // the table filter for the chains column, unserialized from the url
}) => {
  const filteredMarkets = useMemo(() => {
    const chains = parseListFilter(selectedChains)
    return chains ? markets?.filter(market => chains.includes(market.chain)) : markets
  }, [markets, selectedChains])
  const summary = getUserPositionsSummary(filteredMarkets)
  return (
    <MetricsGrid variant='fillMobile'
      sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
    >
      {summary.map((item, index) => (
        <Metric
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={index}
          value={item.metric}
          category="llamalend.marketListSummary"
          valueOptions={{ unit: 'dollar' }}
          label={item.label}
        />
      ))}
    </MetricsGrid>
  )
}
