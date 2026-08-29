import { useCallback, useMemo } from 'react'
import {
  createProposalKey,
  invalidateProposals,
  type ProposalData,
  useProposalsMapperQuery,
} from '@/dao/entities/proposals-mapper'
import { getEthPath } from '@/dao/utils'
import { useFuzzyFilterFn } from '@evm-ui/hooks/useFuzzySearch'
import { usePageFromQueryString } from '@evm-ui/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@evm-ui/hooks/useSortFromQueryString'
import { DAO_ROUTES } from '@evm-ui/shared/routes'
import { useFilters } from '@evm-ui/shared/ui/DataTable/hooks/useFilters'
import { TableHeader } from '@evm-ui/shared/ui/DataTable/TableHeader'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import type { SortingState } from '@tanstack/react-table'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { Spinner } from '@ui/components/Spinner'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { useMappedQuery } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useScrollToTopOnPageChange } from '@ui/features/tables/hooks/useTableScroll'
import { TablePagination } from '@ui/features/tables/TablePagination'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useNavigate } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { columns, ProposalColumnId } from './columns'
import { Proposal } from './components/Proposal'
import { ProposalsToolbar } from './components/ProposalsToolbar'

const { Spacing } = SizesAndSpaces

const EMPTY_PROPOSALS: ProposalData[] = []
const PROPOSALS_PAGE_SIZE = 20 as const
const DEFAULT_SORT: SortingState = [{ id: ProposalColumnId.TimeCreated, desc: true }]

const onReload = () => invalidateProposals({})

export const Proposals = () => {
  const proposalsQuery = useProposalsMapperQuery({})
  const tableQuery = useMappedQuery(
    proposalsQuery,
    useCallback(proposals => Object.values(proposals), []),
  )

  const {
    globalFilter: search,
    setGlobalFilter: setSearch,
    columnFiltersById,
    setColumnFilter,
    resetFilters,
  } = useFilters({ columns: { Status: ProposalColumnId.Status }, resetPageOnChange: true })

  const status = columnFiltersById[ProposalColumnId.Status] ?? 'all'

  const [pagination, onPaginationChange] = usePageFromQueryString(PROPOSALS_PAGE_SIZE)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const globalFilterFn = useFuzzyFilterFn(tableQuery.data ?? EMPTY_PROPOSALS, search, [
    { name: 'id', getFn: proposal => String(proposal.id) },
    'proposer',
    'type',
    'metadata',
  ])

  const table = useCurveTable({
    query: tableQuery,
    columns,
    state: {
      // Finished proposals all have undefined for Ending Soon; break that tie by creation time, newest first.
      sorting: useMemo(() => [...sorting, ...DEFAULT_SORT], [sorting]),
      columnFilters: useMemo(
        () => notFalsy(status !== 'all' && { id: ProposalColumnId.Status, value: status }),
        [status],
      ),
      pagination,
      globalFilter: search,
    },
    onSortingChange,
    onPaginationChange,
    globalFilterFn,
    getRowId: proposal => createProposalKey(proposal.id, proposal.type),
  })

  useScrollToTopOnPageChange({ table })

  const push = useNavigate()
  const handleProposalClick = useCallback(
    (proposalId: string) => push(getEthPath(`${DAO_ROUTES.PAGE_PROPOSALS}/${proposalId}`)),
    [push],
  )

  const rows = table.getRowModel().rows

  return (
    <DetailPageLayout formTabs={null}>
      <Stack sx={{ backgroundColor: theme => theme.design.Layer[1].Fill }}>
        <TableHeader
          title={t`Proposals`}
          onReload={() => void onReload()}
          isLoading={proposalsQuery.isFetching}
          testId="proposal-title"
        />

        <ProposalsToolbar
          onSortingChange={onSortingChange}
          resetFilters={resetFilters}
          search={search}
          setSearch={setSearch}
          setStatus={value => setColumnFilter(ProposalColumnId.Status, value === 'all' ? null : value)}
          sortBy={sorting[0].id}
          sortDirection={sorting[0].desc ? 'desc' : 'asc'}
          status={status}
        />

        <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md, paddingBlockEnd: Spacing.xxl }}>
          {tableQuery.error ? (
            <EvmErrorMessage
              title={t`Error fetching proposals`}
              error={tableQuery.error}
              refreshData={onReload}
              sx={{ paddingBlock: Spacing.xxl }}
            />
          ) : tableQuery.isLoading ? (
            <Spinner />
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
