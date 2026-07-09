import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Grid, { GridProps } from '@mui/material/Grid'
import { parseListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { UserPositionSummaryMetric, useUserPositionsSummary } from './hooks/useUserPositionsSummary'

const { Spacing } = SizesAndSpaces

type UserPositionStatisticsProps = {
  markets: LlamaMarket[] | undefined
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
  const summary = useUserPositionsSummary({ markets: filteredMarkets })
  return (
    <Grid
      container
      spacing={Spacing.sm}
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
