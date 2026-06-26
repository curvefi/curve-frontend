import { type RefObject } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { TableFiltersOverlay } from '@ui-kit/shared/ui/DataTable/TableFiltersOverlay'
import type { PoolListFilterProps } from '../hooks/usePoolListFilters'
import { PoolListFilters } from './PoolListFilters'

type PoolListFiltersOverlayProps = {
  anchorRef: RefObject<HTMLDivElement | null>
  hasActiveFilters: boolean
  open: boolean
  resetFilters: () => void
  setOpen: (open: boolean) => void
} & PoolListFilterProps

export const PoolListFiltersOverlay = ({
  anchorRef,
  hasActiveFilters,
  open,
  resetFilters,
  setOpen,
  ...filterProps
}: PoolListFiltersOverlayProps) => (
  <TableFiltersOverlay
    anchorRef={anchorRef}
    drawerTestId="drawer-filter-menu-dex-pools"
    hasActiveFilters={hasActiveFilters}
    open={open}
    resetFilters={resetFilters}
    setOpen={setOpen}
    title={t`Filter pools`}
  >
    <PoolListFilters {...filterProps} />
  </TableFiltersOverlay>
)
