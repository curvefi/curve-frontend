import { capitalize, last } from 'lodash'
import { useCallback, useId } from 'react'
import { ChevronLeftIcon } from '@evm-ui/shared/icons/ChevronLeftIcon'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { range } from '@primitives/objects.utils'
import type { ReactTable, RowData } from '@tanstack/react-table'

/**
 * A button component representing a specific page in pagination.
 */
const PageButton = <TData extends RowData>({
  page,
  table,
}: {
  page: number
  table: ReactTable<CurveTableFeatures, TData>
}) => (
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
const Spacer = () => {
  const id = useId()
  return (
    <ToggleButton
      disabled
      value={id} // not used, disabled
      sx={{ '&': { backgroundColor: 'transparent', minWidth: 0, padding: 0, width: '11px' } }}
      data-testid="btn-page-ellipsis"
    >
      …
    </ToggleButton>
  )
}

/**
 * Calculate which page numbers to display in the pagination component.
 * It returns three arrays: first pages, pages around the current page, and last pages.
 * The first pages are the first two pages, the around pages are the current page and one before and after,
 * and the last pages are the last two pages.
 */
const getPageOptions = (pageIndex: number, pageCount: number): [number[], number[], number[]] => [
  range(0, 2).filter(p => p < pageIndex - 1),
  range(pageIndex - 1, 3).filter(p => p >= 0 && p < pageCount),
  range(pageCount - 2, 2).filter(p => p > pageIndex + 1),
]

/**
 * A button component for navigating to the previous or next page in pagination.
 */
const NeighborButton = <TData extends RowData>({
  table,
  type,
}: {
  table: ReactTable<CurveTableFeatures, TData>
  type: 'previous' | 'next'
}) => (
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
export const TablePagination = <TData extends RowData>({ table }: { table: ReactTable<CurveTableFeatures, TData> }) => {
  const { pageIndex } = table.state.pagination
  const [firstPages, aroundPages, lastPages] = getPageOptions(pageIndex, table.getPageCount())
  return (
    <Stack direction="row" data-testid="table-pagination" sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <NeighborButton table={table} type="previous" />
      <ToggleButtonGroup value={pageIndex} size="extraSmall" exclusive data-testid="page-buttons">
        {firstPages.map(o => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {firstPages.length > 0 && last(firstPages) !== aroundPages[0] - 1 && <Spacer />}
        {aroundPages.map(o => (
          <PageButton key={o} page={o} table={table} />
        ))}
        {lastPages.length > 0 && lastPages[0] - 1 !== last(aroundPages) && <Spacer />}
        {lastPages.map(o => (
          <PageButton key={o} page={o} table={table} />
        ))}
      </ToggleButtonGroup>
      <NeighborButton table={table} type="next" />
    </Stack>
  )
}
