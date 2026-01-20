import { useCallback } from 'react'
import type { PartialRecord } from '@curvefi/prices-api/objects.util'
import { LlamaMarketColumnId } from '../columns'

export const useSearch = (
  columnFiltersById: PartialRecord<LlamaMarketColumnId, string>,
  setColumnFilter: (id: LlamaMarketColumnId, value: string | null) => void,
) =>
  [
    (columnFiltersById[LlamaMarketColumnId.Assets] as string) ?? '',
    useCallback((search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || null), [setColumnFilter]),
  ] as const
