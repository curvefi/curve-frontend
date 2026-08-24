import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { parseListFilter } from '@evm-ui/shared/ui/DataTable/filters'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Grid, { GridProps } from '@mui/material/Grid'
import { getUserPositionsSummary, UserPositionSummaryMetric } from './user-position.utils'

const { Spacing } = SizesAndSpaces

type UserPositionStatisticsProps = {
  markets: LlamaMarketRow[] | undefined
  selectedChains: string | undefined // the table filter for the chains column, unserialized from the url
}

const UserPositionStatisticItem = ({
  label,
  metric,
  itemSize,
}: UserPositionSummaryMetric & { itemSize: GridProps['size'] }) => (
  <Grid size={itemSize}>
    <Metric value={metric} category="llamalend.marketListSummary" valueOptions={{ unit: 'dollar' }} label={label} />
  </Grid>
)

export const UserPositionSummary = ({ markets, selectedChains }: UserPositionStatisticsProps) => {
  const filteredMarkets = useMemo(() => {
    const chains = parseListFilter(selectedChains)
    return chains ? markets?.filter(market => chains.includes(market.chain)) : markets
  }, [markets, selectedChains])
  const summary = getUserPositionsSummary(filteredMarkets)
  return (
    <Grid
      container
      columnSpacing={Spacing.sm}
      sx={{
        paddingBlock: Spacing.sm,
        paddingInline: Spacing.md,
        backgroundColor: t => t.design.Layer[1].Fill,
      }}
    >
      {summary.map((item, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
        <UserPositionStatisticItem key={index} itemSize={{ mobile: 12, tablet: 12 / summary.length }} {...item} />
      ))}
    </Grid>
  )
}
