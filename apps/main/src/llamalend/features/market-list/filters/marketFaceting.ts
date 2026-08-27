import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { parseListFilter } from '@evm-ui/shared/ui/DataTable/filters'
import { assert } from '@primitives/objects.utils'
import { createFacetedRowModel, type RowModel, type Table } from '@tanstack/react-table'
import { MarketColumnId } from '../columns'

const CHAIN_COLUMN_ID: string = MarketColumnId.Chain

/** Build a row model containing all rows for the selected chains, or all rows when no chain is selected. */
const getChainFilteredRowModel = (
  preRowModel: RowModel<CurveTableFeatures, LlamaMarketRow>,
  selectedChainsFilter: unknown,
): RowModel<CurveTableFeatures, LlamaMarketRow> => {
  if (!selectedChainsFilter) return preRowModel
  const selectedChains = parseListFilter(
    assert(typeof selectedChainsFilter === 'string' && selectedChainsFilter, 'Selected chain filters must be a string'),
  )

  if (!selectedChains?.length) return preRowModel

  const selectedChainSet = new Set(selectedChains)
  const flatRows = preRowModel.flatRows.filter(row => selectedChainSet.has(row.getValue<string>(CHAIN_COLUMN_ID)))
  const rowsById = Object.fromEntries(flatRows.map(row => [row.id, row])) as RowModel<
    CurveTableFeatures,
    LlamaMarketRow
  >['rowsById']

  return {
    rows: preRowModel.rows.filter(row => rowsById[row.id]),
    flatRows,
    rowsById,
  }
}

/**
 * Facet filter UI data from the TanStack table while preserving the market-list dependency rules.
 *
 * The chain column keeps TanStack's default faceting so the available chain list does not depend on the currently
 * selected chain filter. Every other faceted column is scoped only by the selected chains, so collateral/debt options
 * and range maxes update by network but ignore unrelated filters like token, market type, version, search, or favorites
 *
 * This intentionally avoids maintaining an allow-list of faceted columns. If a future filter starts using
 * `getFacetedUniqueValues` or `getFacetedMinMaxValues`, it automatically gets the same chain-scoped behavior unless it
 * is the chain column itself.
 */
export const getMarketFacetedRowModel = (table: Table<CurveTableFeatures, LlamaMarketRow>, columnId: string) => {
  if (columnId === CHAIN_COLUMN_ID) return createFacetedRowModel<CurveTableFeatures, LlamaMarketRow>()(table, columnId)

  let previousPreRowModel: RowModel<CurveTableFeatures, LlamaMarketRow> | undefined
  let previousSelectedChainsFilter: unknown
  let previousRowModel: RowModel<CurveTableFeatures, LlamaMarketRow> | undefined

  return () => {
    const preRowModel = table.getPreFilteredRowModel()
    const selectedChainsFilter = table.store.state.columnFilters.find(({ id }) => id === CHAIN_COLUMN_ID)?.value

    if (
      previousRowModel &&
      previousPreRowModel === preRowModel &&
      previousSelectedChainsFilter === selectedChainsFilter
    ) {
      return previousRowModel
    }

    previousPreRowModel = preRowModel
    previousSelectedChainsFilter = selectedChainsFilter
    previousRowModel = getChainFilteredRowModel(preRowModel, selectedChainsFilter)
    return previousRowModel
  }
}
