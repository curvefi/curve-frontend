import { useCallback } from 'react'
import { LlamaMarketColumnId } from '../columns.enum'

export const useSearch = (
  columnFiltersById: Record<string, unknown>,
  setColumnFilter: (id: string, value: unknown) => void,
) =>
  [
    (columnFiltersById[LlamaMarketColumnId.Assets] as string) ?? '',
    useCallback(
      (search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || undefined),
      [setColumnFilter],
    ),
  ] as const
