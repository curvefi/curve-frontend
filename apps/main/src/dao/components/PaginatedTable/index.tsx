import React, { useState } from 'react'
import styled from 'styled-components'

import TableHeader from './TableHeader'
import Pagination from './Pagination'
import Spinner from '@/dao/components/Spinner'
import ErrorMessage from '@/dao/components/ErrorMessage'
import Box from '@ui/Box'
import NoTableData from './NoTableData'

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
  noDataMessage: string
  smallScreenBreakpoint?: number // rem
  overflowYBreakpoint?: number // rem
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
  noDataMessage,
  smallScreenBreakpoint,
  overflowYBreakpoint,
  gridTemplateColumns,
}: PaginatedTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const FETCH_FEEDBACK_HEIGHT = '15rem'
  const OVERFLOW_Y_BREAKPOINT = overflowYBreakpoint ? `${overflowYBreakpoint}rem` : '46.25rem'

  const ITEMS_PER_PAGE = 50
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
  const noPagination = data.length <= ITEMS_PER_PAGE

  return (
    <Wrapper noPagination={noPagination}>
      <Container overflowYBreakpoint={OVERFLOW_Y_BREAKPOINT}>
        <TableContent minWidth={minWidth}>
          <TableHeader<T>
            columns={columns}
            title={title}
            sortBy={sortBy}
            setSortBy={setSortBy}
            gridTemplateColumns={gridTemplateColumns}
            smallScreenBreakpoint={smallScreenBreakpoint}
          />
          <TableBody noPagination={noPagination}>
            {fetchingState === 'LOADING' && <Spinner height={FETCH_FEEDBACK_HEIGHT} />}
            {fetchingState === 'SUCCESS' &&
              currentItems.map((item, index) => renderRow(item, indexOfFirstItem + index))}
            {fetchingState === 'ERROR' && (
              <ErrorMessageWrapper height={FETCH_FEEDBACK_HEIGHT}>
                <ErrorMessage message={errorMessage} onClick={getData} />
              </ErrorMessageWrapper>
            )}
            {fetchingState === 'SUCCESS' && currentItems.length === 0 && (
              <NoTableData height={FETCH_FEEDBACK_HEIGHT} noDataMessage={noDataMessage} refetchData={getData} />
            )}
          </TableBody>
        </TableContent>
      </Container>
      {fetchingState === 'SUCCESS' && currentItems.length > 0 && !noPagination && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)<{ noPagination: boolean }>`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ noPagination }) => (noPagination ? '0' : 'var(--spacing-3)')};
  width: 100%;
`

const Container = styled.div<{ overflowYBreakpoint: string }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: ${({ overflowYBreakpoint }) => overflowYBreakpoint}) {
    overflow-y: auto;
    overflow-x: auto;
  }
`

const TableContent = styled.div<{ minWidth: number }>`
  min-width: ${({ minWidth }) => `${minWidth}rem`};
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

const TableBody = styled.div<{ noPagination: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ noPagination }) => noPagination && 'padding-bottom: var(--spacing-3)'}
`

export default PaginatedTable
