import { keyBy, type Dictionary } from 'lodash'
import { type MouseEvent, useMemo } from 'react'
import { recordEntries } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { LlamaMarketType, LlamaMarketVersion } from '@ui-kit/types/market'
import { type AssetDetails, LlamaMarket } from '../../../../queries/market-list/llama-markets'
import { LlamaMarketColumnId } from '../../columns'

type MarketTypeFilterValue = LlamaMarketType | 'all'
type MarketVersionFilterValue = LlamaMarketVersion | 'all'

const MARKET_TYPE_LABELS: Record<MarketTypeFilterValue, string> = {
  all: t`All`,
  [LlamaMarketType.Mint]: t`Mint`,
  [LlamaMarketType.Lend]: t`Lending`,
}

const MARKET_VERSION_LABELS: Record<MarketVersionFilterValue, string> = {
  all: t`All`,
  [LlamaMarketVersion.v1]: 'V1',
  [LlamaMarketVersion.v2]: 'V2',
}

export type LlamaMarketsFiltersProps = FilterProps<LlamaMarketColumnId> & {
  data: LlamaMarket[]
}

export const useLlamaMarketsFilters = ({ data, ...filterProps }: LlamaMarketsFiltersProps) => {
  const selectedMarketTypes = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Type])
  const selectedMarketVersions = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Version])
  // Filter options are scoped to selected chains to prevent cross-chain filter data pollution.
  // Example: When viewing Ethereum markets, Arbitrum market data should not influence filter options.
  const selectedChains = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Chain])

  // Relies on data and not markets, because you might have a filter active for a token from a chain
  // before you filtered out that said chain. This would lead to token symbols not loading.
  const tokens = useMemo<Dictionary<AssetDetails>>(
    () =>
      keyBy(
        data.flatMap(market => [market.assets.collateral, market.assets.borrowed]),
        asset => asset.symbol,
      ),
    [data],
  )

  return {
    filterProps,
    tokens,
    markets: useMemo(
      () => (selectedChains?.length ? data.filter(market => selectedChains.includes(market.chain)) : data),
      [data, selectedChains],
    ),
    marketTypeValue: useMemo<MarketTypeFilterValue>(
      () => (selectedMarketTypes?.length === 1 ? (selectedMarketTypes[0] as LlamaMarketType) : 'all'),
      [selectedMarketTypes],
    ),
    marketVersionValue: useMemo<MarketVersionFilterValue>(
      () => (selectedMarketVersions?.length === 1 ? (selectedMarketVersions[0] as MarketVersionFilterValue) : 'all'),
      [selectedMarketVersions],
    ),
    onMarketTypeChange: (_: MouseEvent<HTMLElement>, value: MarketTypeFilterValue | null) =>
      value &&
      filterProps.setColumnFilter(LlamaMarketColumnId.Type, value === 'all' ? null : serializeListFilter([value])),
    onMarketVersionChange: (_: MouseEvent<HTMLElement>, value: MarketVersionFilterValue | null) =>
      value &&
      filterProps.setColumnFilter(LlamaMarketColumnId.Version, value === 'all' ? null : serializeListFilter([value])),
    marketTypeOptions: recordEntries(MARKET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    marketVersionOptions: recordEntries(MARKET_VERSION_LABELS).map(([value, label]) => ({ value, label })),
  }
}
