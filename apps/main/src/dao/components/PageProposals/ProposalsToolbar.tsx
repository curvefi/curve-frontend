import { useRef } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { ArrowDownIcon } from '@evm-ui/shared/icons/ArrowDownIcon'
import {
  TableActiveFilterGroups,
  type TableActiveFilterGroup,
} from '@evm-ui/shared/ui/DataTable/TableActiveFilterGroups'
import { TableActiveFiltersBar } from '@evm-ui/shared/ui/DataTable/TableActiveFiltersBar'
import { TableFilters } from '@evm-ui/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@evm-ui/shared/ui/DataTable/TableFiltersChip'
import { TableFiltersOverlay } from '@evm-ui/shared/ui/DataTable/TableFiltersOverlay'
import { TableHeader } from '@evm-ui/shared/ui/DataTable/TableHeader'
import { TableSortDrawer } from '@evm-ui/shared/ui/DataTable/TableSortDrawer'
import { Select } from '@evm-ui/shared/ui/Select'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import type { ProposalColumnId, ProposalSortBy, ProposalSortDirection, ProposalStatusFilter } from './columns'
import { PROPOSAL_FILTERS, PROPOSAL_SORTING_METHODS } from './constants'
import { ProposalsFilters } from './filters/ProposalsFilters'

const { Spacing } = SizesAndSpaces

type ProposalsToolbarProps = {
  isFetching: boolean
  onReload: () => void
  onSortingChange: OnChangeFn<SortingState>
  resetFilters: () => void
  search: string
  setSearch: (value: string) => void
  setStatus: (value: ProposalStatusFilter) => void
  sortBy: ProposalSortBy
  sortDirection: ProposalSortDirection
  status: ProposalStatusFilter
}

export const ProposalsToolbar = ({
  isFetching,
  onReload,
  onSortingChange,
  resetFilters,
  search,
  setSearch,
  setStatus,
  sortBy,
  sortDirection,
  status,
}: ProposalsToolbarProps) => {
  const isMobile = useIsMobile()
  const [filtersOpen, , , , setFiltersOpen] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const hasActiveFilters = status !== 'all'
  const statusLabel = hasActiveFilters ? PROPOSAL_FILTERS.find(({ key }) => key === status)?.label : null
  const activeFilterGroups: TableActiveFilterGroup[] = [
    {
      key: 'status',
      labels: statusLabel ? [statusLabel] : null,
      onRemove: () => setStatus('all'),
      title: t`Status`,
      getChipTestId: () => 'proposals-active-filter-status',
    },
  ]
  const directionButton = (
    <IconButton
      size="small"
      onClick={() => onSortingChange([{ id: sortBy, desc: sortDirection === 'asc' }])}
      aria-label={sortDirection === 'asc' ? t`Sort descending` : t`Sort ascending`}
    >
      <ArrowDownIcon sx={{ transform: sortDirection === 'asc' ? 'rotate(180deg)' : undefined }} />
    </IconButton>
  )

  return (
    <>
      <TableHeader title={t`Proposals`} onReload={onReload} isLoading={isFetching} testId="proposal-title" />
      <TableFilters<ProposalColumnId>
        testIdPrefix="proposals"
        searchText={search}
        onSearch={setSearch}
        disableSearchAutoFocus
        collapsibleFilters={{
          collapsible: (
            <TableActiveFiltersBar
              hasActiveFilters={hasActiveFilters}
              resetFilters={resetFilters}
              testId="proposals-filters-collapsible"
            >
              {!isMobile && <TableActiveFilterGroups groups={activeFilterGroups} />}
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
          isMobile ? (
            <Stack direction="row">
              <TableSortDrawer
                buttonTestId="btn-drawer-sort-proposals"
                drawerTestId="drawer-sort-menu-proposals"
                onSortingChange={onSortingChange}
                options={PROPOSAL_SORTING_METHODS.map(({ key: id, label }) => ({ id, label }))}
                sortDescending={sortDirection === 'desc'}
                sortField={sortBy}
              />
              {directionButton}
            </Stack>
          ) : (
            <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
              <Select
                size="small"
                value={sortBy}
                onChange={event =>
                  onSortingChange([{ id: event.target.value as ProposalSortBy, desc: sortDirection === 'desc' }])
                }
                inputProps={{ 'aria-label': t`Sort proposals` }}
              >
                {PROPOSAL_SORTING_METHODS.map(({ key, label }) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
              {directionButton}
            </Stack>
          )
        }
      />
      <TableFiltersOverlay
        anchorRef={filterChipRef}
        drawerTestId="drawer-filter-menu-proposals"
        hasActiveFilters={hasActiveFilters}
        open={filtersOpen}
        resetFilters={resetFilters}
        setOpen={setFiltersOpen}
        title={t`Filter proposals`}
      >
        <ProposalsFilters setStatus={setStatus} status={status} />
      </TableFiltersOverlay>
    </>
  )
}
