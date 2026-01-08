import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { parseListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { scopedKey } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from './columns'
import { UserPositionSummaryMetric, useUserPositionsSummary } from './hooks/useUserPositionsSummary'

const { Spacing, IconSize } = SizesAndSpaces

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
}: UserPositionSummaryMetric & { itemSize: number }) => {
  const hasError = !!error
  return (
    <Grid size={itemSize} padding={Spacing.md}>
      <Metric
        value={data}
        size="large"
        valueOptions={{
          decimals: 2,
          unit: 'dollar',
          color: 'textPrimary',
        }}
        label={label}
        rightAdornment={
          <>
            {hasError && (
              <Tooltip
                arrow
                placement="top"
                title={t`Error fetching ${label}`}
                body={<TooltipDescription text={t`Some positions may be missing.`} />}
              >
                <ExclamationTriangleIcon fontSize="small" color="error" />
              </Tooltip>
            )}
            {isLoading && !hasError && <CircularProgress size={IconSize.xs.desktop} />}
          </>
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
    <Grid container spacing={Spacing.sm} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {summary.map((item) => (
        <UserPositionStatisticItem key={item.label} itemSize={12 / summary.length} {...item} />
      ))}
    </Grid>
  )
}
