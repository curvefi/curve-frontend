import { useCallback, useRef } from 'react'
import { useProposalsQuery } from '@/dao/queries/proposals.query'
import { createProposalKey } from '@/dao/utils/proposal'
import { proposalStatusSchema } from '@curvefi/prices-api/proposal'
import { daoPages } from '@evm-ui/shared/routes'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import { getPageCount } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { SortingState } from '@tanstack/react-table'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { Spinner } from '@ui/components/Spinner'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { useLayoutStore } from '@ui/features/layout/store'
import { mapQuery } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useFilters } from '@ui/features/tables/hooks/useFilters'
import { useScrollToTopOnPageChange } from '@ui/features/tables/hooks/useTableScroll'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TablePagination } from '@ui/features/tables/TablePagination'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useNavigate } from '@ui/hooks/router'
import { usePageFromQueryString } from '@ui/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui/hooks/useSortFromQueryString'
import { t } from '@ui/lib/i18n'
import { Proposal } from './components/Proposal'
import { ProposalsToolbar } from './components/ProposalsToolbar'
import { PROPOSAL_SORT_OPTIONS } from './constants'

const { Spacing } = SizesAndSpaces

const PROPOSALS_PAGE_SIZE = 20

const DEFAULT_SORT_OPTION = PROPOSAL_SORT_OPTIONS[0]
const DEFAULT_SORT: SortingState = [{ id: DEFAULT_SORT_OPTION.id, desc: true }]
const SORT_COLUMNS = PROPOSAL_SORT_OPTIONS.map(({ id }) => ({ id, accessorKey: 'timestamp' }))

/**
 * No columns are needed for the table, as we are not rendering a normal table with headers,
 * but rather a list of proposals. Neither would we use them for sorting or filtering as that happens server-side.
 * We want to keep using react table however for the sorting, filtering and pagination logic.
 * If you squint hard enough it's still a table!
 */
const NO_COLUMNS = [] as const

export const Proposals = () => {
  const {
    globalFilter: search,
    setGlobalFilter: setSearch,
    columnFiltersById,
    setColumnFilter,
    resetFilters,
  } = useFilters({ columns: { Status: 'status' }, resetPageOnChange: true })
  const status = proposalStatusSchema.safeParse(columnFiltersById.status).data ?? 'all'

  const [pagination, onPaginationChange] = usePageFromQueryString(PROPOSALS_PAGE_SIZE)
  const { pageIndex, pageSize } = pagination

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT, { columns: SORT_COLUMNS })
  const { id: sortField, desc } = sorting[0]
  const { sortBy } = PROPOSAL_SORT_OPTIONS.find(({ id }) => id === sortField) ?? DEFAULT_SORT_OPTION
  const sortOrder = desc ? 'desc' : 'asc'

  const proposals = useProposalsQuery({ page: pageIndex + 1, pageSize, search, status, sortBy, sortOrder })
  const pageCount = getPageCount(proposals.data?.count, pageSize)

  const table = useCurveTable({
    query: mapQuery(proposals, result => result.proposals),
    columns: NO_COLUMNS,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    pageCount,
    getRowId: proposal => createProposalKey(proposal.id, proposal.type),
  })

  const navHeight = useLayoutStore(state => state.navHeight)
  const tableTopRef = useRef<HTMLDivElement>(null)
  useScrollToTopOnPageChange({ table, tableTopRef })

  const push = useNavigate()
  const handleProposalClick = useCallback((proposalId: string) => push(daoPages.proposal({ proposalId })), [push])

  const rows = table.getRowModel().rows

  return (
    <DetailPageLayout>
      <Stack
        ref={tableTopRef}
        sx={{ backgroundColor: theme => theme.design.Layer[1].Fill, scrollMarginTop: `${navHeight}px` }}
      >
        <TableHeader
          title={t`Proposals`}
          onReload={proposals.refetch}
          isLoading={proposals.isFetching}
          testId="proposal-title"
        />

        <ProposalsToolbar
          onSortingChange={onSortingChange}
          resetFilters={resetFilters}
          search={search}
          setSearch={setSearch}
          setStatus={value => setColumnFilter('status', value === 'all' ? null : value)}
          sortBy={sortField}
          sortDirection={sortOrder}
          status={status}
        />

        <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md, paddingBlockEnd: Spacing.xxl }}>
          {proposals.error ? (
            <EvmErrorMessage
              title={t`Error fetching proposals`}
              error={proposals.error}
              refreshData={proposals.refetch}
              sx={{ paddingBlock: Spacing.xxl }}
            />
          ) : proposals.isLoading ? (
            <Box sx={{ paddingBlockStart: Spacing.xl }}>
              <Spinner />
            </Box>
          ) : rows.length ? (
            rows.map(row => <Proposal key={row.id} proposalData={row.original} handleClick={handleProposalClick} />)
          ) : (
            <Stack sx={{ alignItems: 'center', paddingBlock: Spacing.xxl }}>
              <EmptyStateCard
                title={t`No proposals found`}
                description={t`Try adjusting your filters or search query`}
                button={{ label: t`Show all proposals`, onClick: resetFilters, testId: 'reset-proposals' }}
              />
            </Stack>
          )}

          {table.getPageCount() > 1 && <TablePagination table={table} />}
        </Stack>
      </Stack>
    </DetailPageLayout>
  )
}
