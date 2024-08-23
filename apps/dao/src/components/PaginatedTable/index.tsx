import React, { useState } from 'react'
import styled from 'styled-components'

import TableHeader from './TableHeader'
import Pagination from './Pagination'
import Spinner from '@/components/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import Box from '@/ui/Box'

export interface Column<T> {
  key: keyof T
  label: string
  disabled?: boolean
}

interface PaginatedTableProps<T> {
  sortBy: { key: keyof T; order: 'asc' | 'desc' }
  columns: Column<T>[]
  data: T[]
  fetchingState: 'LOADING' | 'SUCCESS' | 'ERROR'
  title?: string
  errorMessage: string
  setSortBy: (key: keyof T) => void
  getData: () => void
  renderRow: (item: T, index: number) => React.ReactNode
  minWidth: number
  gridTemplateColumns?: string
}

const PaginatedTable = <T,>({
  sortBy,
  columns,
  data,
  fetchingState,
  errorMessage,
  getData,
  title,
  setSortBy,
  renderRow,
  minWidth,
  gridTemplateColumns,
}: PaginatedTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFeedbackHeight = '15rem'

  const ITEMS_PER_PAGE = 50
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)

  return (
    <Wrapper>
      <Container>
        <TableHeader<T>
          columns={columns}
          title={title}
          sortBy={sortBy}
          setSortBy={setSortBy}
          minWidth={minWidth}
          gridTemplateColumns={gridTemplateColumns}
        />
        <TableBody>
          {fetchingState === 'LOADING' && <Spinner height={fetchFeedbackHeight} />}
          {fetchingState === 'SUCCESS' && currentItems.map((item, index) => renderRow(item, indexOfFirstItem + index))}
          {fetchingState === 'ERROR' && (
            <ErrorMessageWrapper height={fetchFeedbackHeight}>
              <ErrorMessage message={errorMessage} onClick={getData} />
            </ErrorMessageWrapper>
          )}
        </TableBody>
      </Container>
      {fetchingState === 'SUCCESS' && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding-bottom: var(--spacing-3);
  width: 100%;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  @media (min-width: 46.25rem) {
    overflow: hidden;
  }
`

const ErrorMessageWrapper = styled(Box)<{ height: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${({ height }) => height};
  padding-top: var(--spacing-4);
  width: 100%;
`

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-3);
  @media (min-width: 46.25rem) {
    overflow-y: auto;
  }
`

export default PaginatedTable
