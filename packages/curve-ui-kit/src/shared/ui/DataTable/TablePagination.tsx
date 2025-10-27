import { useCallback, useId } from 'react'
import { range } from '@curvefi/prices-api/objects.util'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { type Table } from '@tanstack/table-core'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/**
 * A button component representing a specific page in pagination.
 */
const PageButton = <T extends TableItem>({ page, table }: { page: number; table: Table<T> }) => (
  <ToggleButton
    value={page}
    sx={{ backgroundColor: 'transparent' }}
    onClick={useCallback(() => table.setPageIndex(page), [table, page])}
  >
    {page + 1}
  </ToggleButton>
)

/**
 * A spacer component used to indicate skipped pages in pagination.
 * We use a toggle button with a disabled state for consistent styling & to pass the ToggleButtonGroup validation.
 */
const Spacer = () => (
  <ToggleButton
    disabled
    value={useId()} // not used, disabled
    sx={{ '&': { backgroundColor: 'transparent', minWidth: '0', padding: '0', width: '11px' } }}
  >
    …
  </ToggleButton>
)

/**
 * Calculate which page numbers to display in the pagination component.
 * It returns three arrays: first pages, pages around the current page, and last pages.
 * The first pages are the first two pages, the around pages are the current page and one before and after,
 * and the last pages are the last two pages.
 */
const getPageOptions = (pageIndex: number, pageCount: number): [number[], number[], number[]] => [
  range(0, 2).filter((p) => p < pageIndex - 1),
  range(pageIndex - 1, 3).filter((p) => p >= 0 && p < pageCount),
  range(pageCount - 2, 2).filter((p) => p > pageIndex + 1),
]

/**
 * Table pagination component for navigating through pages of a data table.
 * Renders previous/next buttons and page number buttons with ellipses for skipped pages.
 */
export const TablePagination = <T extends TableItem>({ table }: { table: Table<T> }) => {
  const { pageIndex } = table.getState().pagination
  const [firstPages, aroundPages, lastPages] = getPageOptions(pageIndex, table.getPageCount())
  return (
    <Stack justifyContent="center" direction="row">
      <IconButton size="extraSmall" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        <ChevronDownIcon sx={{ transform: `rotate(90deg)` }} />
      </IconButton>
      <ToggleButtonGroup value={pageIndex} size="extraSmall" exclusive>
        {firstPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {firstPages.length > 0 && <Spacer />}
        {aroundPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {lastPages.length > 0 && <Spacer />}
        {lastPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
        <IconButton size="extraSmall" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ChevronDownIcon sx={{ transform: `rotate(-90deg)` }} />
        </IconButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
