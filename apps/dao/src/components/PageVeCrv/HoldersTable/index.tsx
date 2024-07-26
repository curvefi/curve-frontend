import React, { useState } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'

import TableHeader from './TableHeader'
import TableRow from './TableRow'
import Pagination from './Pagination'
import Box from '@/ui/Box'

const TopHoldersTable: React.FC = () => {
  const { veCrvHolders, allHoldersSortBy } = useStore((state) => state.vecrv)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 100

  const indexOfLastHolder = currentPage * ITEMS_PER_PAGE
  const indexOfFirstHolder = indexOfLastHolder - ITEMS_PER_PAGE
  const currentHolders = veCrvHolders.allHolders.slice(indexOfFirstHolder, indexOfLastHolder)

  const totalPages = Math.ceil(veCrvHolders.allHolders.length / ITEMS_PER_PAGE)

  return (
    <Wrapper variant="secondary">
      <TableHeader />
      <TableBody>
        {currentHolders.map((holder, index) => (
          <TableRow
            key={holder.user}
            holder={holder}
            sortBy={allHoldersSortBy.sortBy}
            rank={indexOfFirstHolder + index + 1}
          />
        ))}
      </TableBody>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
