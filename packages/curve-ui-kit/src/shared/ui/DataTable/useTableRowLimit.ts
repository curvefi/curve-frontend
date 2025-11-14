import { useState, useTransition } from 'react'

/**
 * Hook to manage table row limiting functionality.
 * When a rowLimit is provided, the table will initially show only that many rows
 * with a "show all" button. Once clicked, all rows are shown with pagination enabled.
 */
export function useTableRowLimit(rowLimit?: number) {
  const [showAllRows, setShowAllRows] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isLimited = rowLimit != null && !showAllRows

  const handleShowAll = () => {
    // when toggling the show all rows, we want to use a transition to avoid blocking the UI
    startTransition(() => {
      setShowAllRows(true)
    })
  }

  const reset = () => {
    setShowAllRows(false)
  }

  return {
    isLimited,
    isLoading: isPending,
    handleShowAll,
    reset,
  }
}
