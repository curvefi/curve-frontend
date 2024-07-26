import React, { useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import TableHeader from './TableHeader'
import TableRow from './TableRow'
import Pagination from './Pagination'
import Spinner from '../components/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import Box from '@/ui/Box'

const TopHoldersTable: React.FC = () => {
  const { veCrvHolders, allHoldersSortBy, getVeCrvHolders } = useStore((state) => state.vecrv)
  const [currentPage, setCurrentPage] = useState(1)

  const holdersLoading = veCrvHolders.fetchStatus === 'LOADING'
  const holdersError = veCrvHolders.fetchStatus === 'ERROR'
  const holdersReady = veCrvHolders.fetchStatus === 'SUCCESS'

  const ITEMS_PER_PAGE = 100

  const indexOfLastHolder = currentPage * ITEMS_PER_PAGE
  const indexOfFirstHolder = indexOfLastHolder - ITEMS_PER_PAGE
  const currentHolders = veCrvHolders.allHolders.slice(indexOfFirstHolder, indexOfLastHolder)

  const totalPages = Math.ceil(veCrvHolders.allHolders.length / ITEMS_PER_PAGE)

  return (
    <Wrapper variant="secondary">
      <TableHeader />
      <TableBody>
        {holdersLoading && <Spinner height="31.25rem" />}
        {holdersReady &&
          currentHolders.map((holder, index) => (
            <TableRow
              key={holder.user}
              holder={holder}
              sortBy={allHoldersSortBy.sortBy}
              rank={indexOfFirstHolder + index + 1}
            />
          ))}
        {holdersError && <ErrorMessage message={t`Error fetching holder data.`} onClick={getVeCrvHolders} />}
      </TableBody>
      {holdersReady && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  max-height: 46.875rem;
  padding-bottom: var(--spacing-3);
`

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-3);
  overflow-y: auto;
`

export default TopHoldersTable
