import { keyBy, type Dictionary } from 'lodash'
import { type MouseEvent, useMemo } from 'react'
import { notFalsyArray, recordEntries } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useFacetedMaxMinValue } from '@ui-kit/shared/ui/DataTable/hooks/useFacetedMaxMinValue'
import { useFacetedSortedOptions } from '@ui-kit/shared/ui/DataTable/hooks/useFacetedSortedOptions'
import { MarketType, MarketVersion } from '@ui-kit/types/market'
import { type QueryProp } from '@ui-kit/types/util'
import { type AssetDetails, LlamaMarket } from '../../../../queries/market-list/llama-markets'
import { MarketColumnId } from '../../columns'

const ALL_FILTER_VALUE = 'all' as const

type AllFilterValue = typeof ALL_FILTER_VALUE
type MarketTypeFilterValue = MarketType | AllFilterValue
type MarketVersionFilterValue = MarketVersion | AllFilterValue

const getSelectFilterValue = <T extends string>(filter: string[] | undefined) =>
  (filter?.length ? filter[0] : ALL_FILTER_VALUE) as T | AllFilterValue

const setSelectFilterValue = <T extends string>(
  setColumnFilter: FilterProps<MarketColumnId>['setColumnFilter'],
  columnId: MarketColumnId,
  value: T | AllFilterValue | null,
) => value && setColumnFilter(columnId, value === ALL_FILTER_VALUE ? null : serializeListFilter([value]))

const MARKET_TYPE_LABELS: Record<MarketTypeFilterValue, string> = {
  [ALL_FILTER_VALUE]: t`All`,
  [MarketType.Mint]: t`Mint`,
  [MarketType.Lend]: t`Lending`,
}

const MARKET_VERSION_LABELS: Record<MarketVersionFilterValue, string> = {
  [ALL_FILTER_VALUE]: t`All`,
  [MarketVersion.v1]: 'v1',
  [MarketVersion.v2]: 'v2',
}

export type MarketsFiltersProps = FilterProps<MarketColumnId> & {
  marketsQuery: QueryProp<LlamaMarket[]>
  table: TanstackTable<LlamaMarket>
}

export const useMarketsFilters = ({ marketsQuery, table, ...filterProps }: MarketsFiltersProps) => {
  const selectedMarketTypes = parseListFilter(filterProps.columnFiltersById[MarketColumnId.Type])
  const selectedMarketVersions = parseListFilter(filterProps.columnFiltersById[MarketColumnId.Version])
  const collateralTokenOptions = useFacetedSortedOptions({ table, columnId: MarketColumnId.CollateralSymbol })
  const borrowedTokenOptions = useFacetedSortedOptions({ table, columnId: MarketColumnId.BorrowedSymbol })
  const borrowRateRange = useFacetedMaxMinValue({ table, columnId: MarketColumnId.BorrowRate })
  const tvlRange = useFacetedMaxMinValue({ table, columnId: MarketColumnId.Tvl })
  const liquidityRange = useFacetedMaxMinValue({ table, columnId: MarketColumnId.LiquidityUsd })
  const utilizationRange = useFacetedMaxMinValue({ table, columnId: MarketColumnId.UtilizationPercent })
  const maxLtvRange = useFacetedMaxMinValue({ table, columnId: MarketColumnId.MaxLtv })

  // Relies on data and not markets, because you might have a filter active for a token from a chain
  // before you filtered out that said chain. This would lead to token symbols not loading.
  const tokens = useMemo<Dictionary<AssetDetails>>(
    () =>
      keyBy(
        notFalsyArray(marketsQuery.data).flatMap(market => [market.assets.collateral, market.assets.borrowed]),
        asset => asset.symbol,
      ),
    [marketsQuery.data],
  )

  return {
    filterProps,
    tokens,
    collateralTokenOptions,
    borrowedTokenOptions,
    borrowRateRange,
    tvlRange,
    liquidityRange,
    utilizationRange,
    maxLtvRange,
    marketTypeValue: useMemo<MarketTypeFilterValue>(
      () => getSelectFilterValue<MarketType>(selectedMarketTypes),
      [selectedMarketTypes],
    ),
    marketVersionValue: useMemo<MarketVersionFilterValue>(
      () => getSelectFilterValue<MarketVersion>(selectedMarketVersions),
      [selectedMarketVersions],
    ),
    onMarketTypeChange: (_: MouseEvent<HTMLElement>, value: MarketTypeFilterValue | null) =>
      setSelectFilterValue(filterProps.setColumnFilter, MarketColumnId.Type, value),
    onMarketVersionChange: (_: MouseEvent<HTMLElement>, value: MarketVersionFilterValue | null) =>
      setSelectFilterValue(filterProps.setColumnFilter, MarketColumnId.Version, value),
    marketTypeOptions: recordEntries(MARKET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    marketVersionOptions: recordEntries(MARKET_VERSION_LABELS)
      .map(([value, label]) => ({ value, label }))
      // numeric like object keys (e.g. "1") are returned first, so we sort `all` back to the front for the button group
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      .sort(
        ({ value: left }, { value: right }) => Number(right === ALL_FILTER_VALUE) - Number(left === ALL_FILTER_VALUE),
      ),
  }
}
