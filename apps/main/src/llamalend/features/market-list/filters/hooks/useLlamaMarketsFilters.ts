import { keyBy, type Dictionary } from 'lodash'
import { type MouseEvent, useMemo } from 'react'
import { notFalsyArray, recordEntries } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useFacetedMaxMinValue } from '@ui-kit/shared/ui/DataTable/hooks/useFacetedMaxMinValue'
import { useFacetedSortedOptions } from '@ui-kit/shared/ui/DataTable/hooks/useFacetedSortedOptions'
import { LlamaMarketType, LlamaMarketVersion } from '@ui-kit/types/market'
import { type QueryProp } from '@ui-kit/types/util'
import { type AssetDetails, LlamaMarket } from '../../../../queries/market-list/llama-markets'
import { LlamaMarketColumnId } from '../../columns'

const ALL_FILTER_VALUE = 'all' as const

type AllFilterValue = typeof ALL_FILTER_VALUE
type MarketTypeFilterValue = LlamaMarketType | AllFilterValue
type MarketVersionFilterValue = LlamaMarketVersion | AllFilterValue

const getSelectFilterValue = <T extends string>(filter: string[] | undefined) =>
  (filter?.length ? filter[0] : ALL_FILTER_VALUE) as T | AllFilterValue

const setSelectFilterValue = <T extends string>(
  setColumnFilter: FilterProps<LlamaMarketColumnId>['setColumnFilter'],
  columnId: LlamaMarketColumnId,
  value: T | AllFilterValue | null,
) => value && setColumnFilter(columnId, value === ALL_FILTER_VALUE ? null : serializeListFilter([value]))

const MARKET_TYPE_LABELS: Record<MarketTypeFilterValue, string> = {
  [ALL_FILTER_VALUE]: t`All`,
  [LlamaMarketType.Mint]: t`Mint`,
  [LlamaMarketType.Lend]: t`Lending`,
}

const MARKET_VERSION_LABELS: Record<MarketVersionFilterValue, string> = {
  [ALL_FILTER_VALUE]: t`All`,
  [LlamaMarketVersion.v1]: 'v1',
  [LlamaMarketVersion.v2]: 'v2',
}

export type LlamaMarketsFiltersProps = FilterProps<LlamaMarketColumnId> & {
  marketsQuery: QueryProp<LlamaMarket[]>
  table: TanstackTable<LlamaMarket>
}

export const useLlamaMarketsFilters = ({ marketsQuery, table, ...filterProps }: LlamaMarketsFiltersProps) => {
  const selectedMarketTypes = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Type])
  const selectedMarketVersions = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Version])
  const collateralTokenOptions = useFacetedSortedOptions({ table, columnId: LlamaMarketColumnId.CollateralSymbol })
  const borrowedTokenOptions = useFacetedSortedOptions({ table, columnId: LlamaMarketColumnId.BorrowedSymbol })
  const borrowRateRange = useFacetedMaxMinValue({ table, columnId: LlamaMarketColumnId.BorrowRate })
  const tvlRange = useFacetedMaxMinValue({ table, columnId: LlamaMarketColumnId.Tvl })
  const liquidityRange = useFacetedMaxMinValue({ table, columnId: LlamaMarketColumnId.LiquidityUsd })
  const utilizationRange = useFacetedMaxMinValue({ table, columnId: LlamaMarketColumnId.UtilizationPercent })
  const maxLtvRange = useFacetedMaxMinValue({ table, columnId: LlamaMarketColumnId.MaxLtv })

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
      () => getSelectFilterValue<LlamaMarketType>(selectedMarketTypes),
      [selectedMarketTypes],
    ),
    marketVersionValue: useMemo<MarketVersionFilterValue>(
      () => getSelectFilterValue<LlamaMarketVersion>(selectedMarketVersions),
      [selectedMarketVersions],
    ),
    onMarketTypeChange: (_: MouseEvent<HTMLElement>, value: MarketTypeFilterValue | null) =>
      setSelectFilterValue(filterProps.setColumnFilter, LlamaMarketColumnId.Type, value),
    onMarketVersionChange: (_: MouseEvent<HTMLElement>, value: MarketVersionFilterValue | null) =>
      setSelectFilterValue(filterProps.setColumnFilter, LlamaMarketColumnId.Version, value),
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
