import { capitalize, last } from 'lodash'
import { useCallback, useId } from 'react'
import { range } from '@curvefi/primitives/objects.utils'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { type Table } from '@tanstack/table-core'
import { ChevronLeftIcon } from '@ui-kit/shared/icons/ChevronLeftIcon'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/**
 * A button component representing a specific page in pagination.
 */
const PageButton = <T extends TableItem>({ page, table }: { page: number; table: Table<T> }) => (
  <ToggleButton
    value={page}
    sx={{ backgroundColor: 'transparent' }}
    data-testid={`btn-page-${page + 1}`}
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
    sx={{ '&': { backgroundColor: 'transparent', minWidth: 0, padding: 0, width: '11px' } }}
    data-testid="btn-page-ellipsis"
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
 * A button component for navigating to the previous or next page in pagination.
 */
const NeighborButton = <T extends TableItem>({ table, type }: { table: Table<T>; type: 'previous' | 'next' }) => (
  <IconButton
    size="extraExtraSmall"
    {...(table[`getCan${capitalize(type)}Page`]()
      ? { 'data-testid': `btn-page-${type.substring(0, 4)}`, onClick: table[`${type}Page`] }
      : { disabled: true })}
  >
    <ChevronLeftIcon {...(type === 'next' && { sx: { transform: 'rotate(180deg)' } })} />
  </IconButton>
)

/**
 * Table pagination component for navigating through pages of a data table.
 * Renders previous/next buttons and page number buttons with ellipses for skipped pages.
 */
export const TablePagination = <T extends TableItem>({ table }: { table: Table<T> }) => {
  const { pageIndex } = table.getState().pagination
  const [firstPages, aroundPages, lastPages] = getPageOptions(pageIndex, table.getPageCount())
  return (
    <Stack justifyContent="center" alignItems="center" direction="row" data-testid="table-pagination">
      <NeighborButton table={table} type="previous" />

      <ToggleButtonGroup value={pageIndex} size="extraSmall" exclusive data-testid="page-buttons">
        {firstPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {firstPages.length > 0 && last(firstPages) !== aroundPages[0] - 1 && <Spacer />}
        {aroundPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {lastPages.length > 0 && lastPages[0] - 1 !== last(aroundPages) && <Spacer />}
        {lastPages.map((o) => (
          <PageButton key={o} page={o} table={table} />
        ))}
      </ToggleButtonGroup>

      <NeighborButton table={table} type="next" />
    </Stack>
  )
}
