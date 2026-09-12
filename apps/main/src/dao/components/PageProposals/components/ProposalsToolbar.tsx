import { useRef, useState } from 'react'
import { TableActiveFilterChip } from '@evm-ui/shared/ui/DataTable/TableActiveFilterChip'
import { TableActiveFiltersBar } from '@evm-ui/shared/ui/DataTable/TableActiveFiltersBar'
import { TableFilterButtonGroup } from '@evm-ui/shared/ui/DataTable/TableFilterButtonGroup'
import { TableFilters } from '@evm-ui/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@evm-ui/shared/ui/DataTable/TableFiltersChip'
import { TableFiltersOverlay } from '@evm-ui/shared/ui/DataTable/TableFiltersOverlay'
import { TableSelectedFilterChips } from '@evm-ui/shared/ui/DataTable/TableSelectedFilterChips'
import { TableSortDrawer } from '@evm-ui/shared/ui/DataTable/TableSortDrawer'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import type { OnChangeFn, SortDirection, SortingState } from '@tanstack/react-table'
import { Select } from '@ui/components/Select'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ArrowDownIcon } from '@ui/icons/ArrowDownIcon'
import { RotatableIcon } from '@ui/icons/RotatableIcon'
import { t } from '@ui/lib/i18n'
import { ProposalColumnId } from '../columns'

const { Spacing } = SizesAndSpaces

const PROPOSAL_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'executable', label: 'Executable' },
  { value: 'executed', label: 'Executed' },
  { value: 'denied', label: 'Denied' },
] as const

const PROPOSAL_SORTING_METHODS = [
  { id: ProposalColumnId.TimeCreated, label: 'Time Created' },
  { id: ProposalColumnId.EndingSoon, label: 'Ending Soon' },
] as const

export const ProposalsToolbar = ({
  search,
  setSearch,
  status,
  setStatus,
  sortBy,
  sortDirection,
  resetFilters,
  onSortingChange,
}: {
  search: string
  setSearch: (value: string) => void
  status: string
  setStatus: (value: string) => void
  sortBy: string
  sortDirection: SortDirection
  resetFilters: () => void
  onSortingChange: OnChangeFn<SortingState>
}) => {
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const hasActiveFilters = status !== 'all'

  return (
    <Box sx={{ padding: Spacing.sm }}>
      <TableFilters
        testIdPrefix="proposals"
        searchText={search}
        onSearch={setSearch}
        collapsibleFilters={{
          collapsible: hasActiveFilters && (
            <TableActiveFiltersBar
              hasActiveFilters={hasActiveFilters}
              resetFilters={resetFilters}
              testId="proposals-filters-collapsible"
            >
              <TableSelectedFilterChips title={t`Status`}>
                <TableActiveFilterChip
                  label={PROPOSAL_FILTERS.find(({ value }) => value === status)?.label ?? '?'}
                  toggle={() => setStatus('all')}
                />
              </TableSelectedFilterChips>
            </TableActiveFiltersBar>
          ),
          hasActiveFilters,
        }}
        filterChip={
          <TableFiltersChip
            popoverFilterChipRef={filterChipRef}
            open={filtersOpen}
            setOpen={setFiltersOpen}
            testId="btn-open-filters-proposals"
          />
        }
        sortChip={
          <Stack direction="row">
            {isMobile ? (
              <TableSortDrawer
                buttonTestId="btn-drawer-sort-proposals"
                drawerTestId="drawer-sort-menu-proposals"
                onSortingChange={onSortingChange}
                options={PROPOSAL_SORTING_METHODS}
                sortDescending={sortDirection === 'desc'}
                sortField={sortBy}
              />
            ) : (
              <Select
                size="small"
                value={sortBy}
                onChange={event =>
                  onSortingChange([{ id: event.target.value as ProposalColumnId, desc: sortDirection === 'desc' }])
                }
              >
                {PROPOSAL_SORTING_METHODS.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            )}
            <IconButton size="small" onClick={() => onSortingChange([{ id: sortBy, desc: sortDirection === 'asc' }])}>
              <RotatableIcon icon={ArrowDownIcon} rotated={sortDirection === 'asc'} fontSize={24} />
            </IconButton>
          </Stack>
        }
      />

      <TableFiltersOverlay
        title={t`Filter proposals`}
        anchorRef={filterChipRef}
        hasActiveFilters={hasActiveFilters}
        open={filtersOpen}
        resetFilters={resetFilters}
        setOpen={setFiltersOpen}
        disableSticky
        drawerTestId="drawer-filter-menu-proposals"
      >
        <Stack sx={{ padding: Spacing.sm }}>
          <TableFilterButtonGroup
            title={t`Status`}
            value={status}
            onChange={(_, value) => value && setStatus(value)}
            ariaLabel={t`Filter proposals by status`}
            options={PROPOSAL_FILTERS}
          />
        </Stack>
      </TableFiltersOverlay>
    </Box>
  )
}
