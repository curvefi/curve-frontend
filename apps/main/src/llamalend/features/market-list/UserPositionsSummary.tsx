import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import Grid, { GridProps } from '@mui/material/Grid'
import { useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { parseListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { scopedKey } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from './columns'
import { UserPositionSummaryMetric, useUserPositionsSummary } from './hooks/useUserPositionsSummary'

const { Spacing } = SizesAndSpaces

type UserPositionStatisticsProps = {
  markets: LlamaMarket[] | undefined
  tab: MarketRateType
}

const UserPositionStatisticItem = ({
  label,
  data,
  isLoading,
  error,
  itemSize,
}: UserPositionSummaryMetric & { itemSize: GridProps['size'] }) => {
  const hasError = !!error
  return (
    <Grid size={itemSize}>
      <Metric
        value={!hasError && data}
        size="large"
        // isLoading can still be true if there is an error
        loading={!hasError && isLoading}
        valueOptions={{
          unit: 'dollar',
        }}
        label={label}
        rightAdornment={
          hasError && (
            <Tooltip
              arrow
              placement="top"
              title={t`Error fetching ${label}`}
              body={<TooltipDescription text={t`Some positions could not be loaded correctly.`} />}
            >
              <ExclamationTriangleIcon fontSize="small" color="error" />
            </Tooltip>
          )
        }
      />
    </Grid>
  )
}

export const UserPositionSummary = ({ markets, tab }: UserPositionStatisticsProps) => {
  const searchParams = useSearchParams()
  const selectedChains = useMemo(() => {
    const filterKey = scopedKey(tab.toLowerCase(), LlamaMarketColumnId.Chain)
    return parseListFilter(searchParams.get(filterKey) ?? undefined)
  }, [searchParams, tab])
  const filteredMarkets = useMemo(
    () => (selectedChains?.length ? markets?.filter((market) => selectedChains.includes(market.chain)) : markets),
    [markets, selectedChains],
  )
  const summary = useUserPositionsSummary({ markets: filteredMarkets })
  return (
    <Grid
      container
      paddingBlockStart={Spacing.md}
      paddingInline={Spacing.md}
      spacing={Spacing.md}
      sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
    >
      {summary.map((item) => (
        <UserPositionStatisticItem key={item.label} itemSize={{ mobile: 6, tablet: 12 / summary.length }} {...item} />
      ))}
    </Grid>
  )
}
