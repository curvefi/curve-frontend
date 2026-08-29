import { useCallback, useEffect } from 'react'
import type { ProposalData } from '@/dao/entities/proposals'
import { useSearchNavigate, useSearchParams } from '@evm-ui/hooks/router'
import { usePageFromQueryString } from '@evm-ui/hooks/usePageFromQueryString'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import type { ReactTable } from '@tanstack/react-table'

export const PROPOSALS_PAGE_SIZE = 20

export type ProposalsQueryUpdater = (update: Record<string, string | string[] | null>) => void

export const useProposalsPagination = () => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const [pagination, onPaginationChange] = usePageFromQueryString(PROPOSALS_PAGE_SIZE)
  const updateQueryAndResetPage = useCallback<ProposalsQueryUpdater>(
    update => searchNavigate({ ...update, page: null }, { replace: true }),
    [searchNavigate],
  )

  return { pagination, onPaginationChange, updateQueryAndResetPage }
}

export const useResetOutOfRangeProposalPage = (
  table: ReactTable<CurveTableFeatures, ProposalData>,
  isLoaded: boolean,
) => {
  const { pageIndex } = table.state.pagination
  const pageCount = table.getPageCount()

  useEffect(() => {
    if (isLoaded && pageIndex > 0 && pageIndex >= pageCount) table.firstPage()
  }, [isLoaded, pageCount, pageIndex, table])
}
