import { useCallback, useMemo, useRef } from 'react'
import { createProposalKey, type ProposalData } from '@/dao/entities/proposals'
import { getEthPath } from '@/dao/utils'
import { useLayoutStore } from '@evm-ui/features/layout'
import { useNavigate } from '@evm-ui/hooks/router'
import { t } from '@evm-ui/lib/i18n'
import { DAO_ROUTES } from '@evm-ui/shared/routes'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { useScrollToTopOnPageChange } from '@evm-ui/shared/ui/DataTable/hooks/useTableScroll'
import { TablePagination } from '@evm-ui/shared/ui/DataTable/TablePagination'
import { EmptyStateCard } from '@evm-ui/shared/ui/EmptyStateCard'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import { Spinner } from '@evm-ui/shared/ui/Spinner'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { createProposalColumns } from './columns'
import { useProposalsFilters } from './hooks/useProposalsFilters'
import { useProposalsGlobalFilterFn } from './hooks/useProposalsGlobalFilter'
import { useProposalsPagination, useResetOutOfRangeProposalPage } from './hooks/useProposalsPagination'
import { useProposalsSorting } from './hooks/useProposalsSorting'
import { useProposalsTable } from './hooks/useProposalsTable'
import { Proposal } from './Proposal'
import { ProposalsToolbar } from './ProposalsToolbar'

const { Spacing } = SizesAndSpaces
const EMPTY_PROPOSALS: ProposalData[] = []

export const Proposals = () => {
  const push = useNavigate()
  const listTopRef = useRef<HTMLDivElement>(null)
  const navHeight = useLayoutStore(state => state.navHeight)
  const { tableQuery, isFetching, onReload } = useProposalsTable()
  const data = tableQuery.data ?? EMPTY_PROPOSALS
  const { search, setSearch, status, setStatus, columnFilters, resetFilters } = useProposalsFilters()
  const { pagination, onPaginationChange, updateQueryAndResetPage } = useProposalsPagination()
  const { sorting, onSortingChange, sortBy, sortDirection } = useProposalsSorting(updateQueryAndResetPage)
  const globalFilterFn = useProposalsGlobalFilterFn(data, search)
  const columns = useMemo(() => createProposalColumns(sortDirection), [sortDirection])
  const table = useCurveTable({
    query: tableQuery,
    columns,
    state: { sorting, columnFilters, pagination, globalFilter: search },
    onSortingChange,
    onPaginationChange,
    globalFilterFn,
    getRowId: proposal => createProposalKey(proposal.id, proposal.type),
  })

  useResetOutOfRangeProposalPage(table, tableQuery.data != null)
  useScrollToTopOnPageChange({ table, tableTopRef: listTopRef })

  const handleProposalClick = useCallback(
    (proposalId: string) => push(getEthPath(`${DAO_ROUTES.PAGE_PROPOSALS}/${proposalId}`)),
    [push],
  )
  const rows = table.getRowModel().rows
  const hasActiveFilters = !!search || status !== 'all'

  return (
    <DetailPageLayout formTabs={null}>
      <Stack sx={{ backgroundColor: theme => theme.design.Layer[1].Fill }}>
        <ProposalsToolbar
          isFetching={isFetching}
          onReload={() => void onReload()}
          onSortingChange={onSortingChange}
          resetFilters={resetFilters}
          search={search}
          setSearch={setSearch}
          setStatus={setStatus}
          sortBy={sortBy}
          sortDirection={sortDirection}
          status={status}
        />

        <Stack
          ref={listTopRef}
          sx={{
            gap: Spacing.md,
            paddingInline: { mobile: 0, tablet: Spacing.md.tablet, desktop: Spacing.md.desktop },
            paddingBlockStart: Spacing.md,
            paddingBlockEnd: Spacing.xxl,
            scrollMarginTop: navHeight,
          }}
        >
          {tableQuery.error ? (
            <ErrorMessage
              title={t`Error fetching proposals`}
              error={tableQuery.error}
              refreshData={onReload}
              sx={{ paddingBlock: Spacing.xxl }}
            />
          ) : tableQuery.isLoading ? (
            <Stack sx={{ alignItems: 'center', paddingBlock: Spacing.xxl }}>
              <Spinner />
            </Stack>
          ) : rows.length ? (
            rows.map(row => <Proposal key={row.id} proposalData={row.original} handleClick={handleProposalClick} />)
          ) : (
            <Stack sx={{ alignItems: 'center', paddingBlock: Spacing.xxl }}>
              <EmptyStateCard
                title={t`No proposals found`}
                description={hasActiveFilters ? t`Try adjusting your filters or search query` : undefined}
                button={
                  hasActiveFilters
                    ? { label: t`Show all proposals`, onClick: resetFilters, testId: 'reset-proposals' }
                    : undefined
                }
              />
            </Stack>
          )}

          {!tableQuery.isLoading && !tableQuery.error && data.length > 0 && table.getPageCount() > 1 && (
            <Box sx={{ paddingBlockStart: Spacing.sm }}>
              <TablePagination table={table} />
            </Box>
          )}
        </Stack>
      </Stack>
    </DetailPageLayout>
  )
}
