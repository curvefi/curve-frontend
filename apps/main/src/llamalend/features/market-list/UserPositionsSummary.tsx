import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import Grid, { GridProps } from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
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
  metric: { data, isLoading, error },
  itemSize,
}: UserPositionSummaryMetric & { itemSize: GridProps['size'] }) => {
  const hasError = !!error
  return (
    <Grid size={itemSize}>
      <Metric
        value={data}
        size="medium"
        // isLoading can still be true if there is an error
        loading={!hasError && isLoading}
        valueOptions={{
          unit: 'dollar',
        }}
        label={label}
        error={error}
        errorTooltip={{
          placement: 'top',
          title: t`Error fetching ${label}`,
          body: <TooltipDescription text={t`Some positions could not be loaded correctly.`} />,
        }}
      />
    </Grid>
  )
}

export const UserPositionSummary = ({ markets, selectedChains }: UserPositionStatisticsProps) => {
  const filteredMarkets = useMemo(() => {
    const chains = parseListFilter(selectedChains)
    return chains ? markets?.filter(market => chains.includes(market.chain)) : markets
  }, [markets, selectedChains])
  const summary = useUserPositionsSummary({ markets: filteredMarkets })
  return (
    <Grid
      container
      spacing={Spacing.md}
      sx={{
        paddingBlock: Spacing.sm,
        paddingInline: Spacing.md,
        backgroundColor: t => t.design.Layer[1].Fill,
      }}
    >
      {summary.map((item, index) => (
        <UserPositionStatisticItem key={index} itemSize={{ mobile: 6, tablet: 12 / summary.length }} {...item} />
      ))}
    </Grid>
  )
}
