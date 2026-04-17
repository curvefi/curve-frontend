import { useCallback, useState, useTransition } from 'react'

/**
 * Hook to manage table row limiting functionality.
 * When a rowLimit is provided, the table will initially show only that many rows with a "show all" button.
 * Except when we have exactly rowLimit+1 rows, there is no point in hiding a single row.
 * Once clicked, all rows are shown with pagination enabled.
 */
export function useTableRowLimit(rowLimit: number | undefined, totalRows: number) {
  const [isShowingAllRows, setShowAll] = useState(false)
  const [isLoading, startTransition] = useTransition()

  const isLimited = rowLimit != null && !isShowingAllRows && totalRows > rowLimit + 1 // don't hide a single row, saves little space

  // when toggling the show all rows, use a transition to avoid blocking the UI
  const onShowAll = useCallback(() => startTransition(() => setShowAll(true)), [startTransition])

  return { isLimited, isLoading, onShowAll }
}
