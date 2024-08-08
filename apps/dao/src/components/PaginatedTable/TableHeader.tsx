import styled from 'styled-components'

import Icon from '@/ui/Icon'
import Button from '@/ui/Button'

interface TableHeaderProps<T> {
  columns: { key: keyof T; label: string; disabled?: boolean }[]
  title: string
  sortBy: { key: keyof T; order: 'asc' | 'desc' }
  setSortBy: (key: keyof T) => void
  minWidth: number
}

const TableHeader = <T,>({ columns, title, sortBy, setSortBy, minWidth }: TableHeaderProps<T>) => (
  <TableHeaderWrapper>
    {title && <TableTitle>{title}</TableTitle>}
    <TableContainer columns={columns.length} minWidth={minWidth}>
      {columns.map((column) => (
        <TableTitleButton
          disabled={column.disabled}
          key={column.key as string}
          variant="text"
          onClick={() => !column.disabled && setSortBy(column.key)}
        >
          {column.label}
          {sortBy.key === column.key && (
            <StyledIcon size={16} name={sortBy.order === 'asc' ? 'ArrowUp' : 'ArrowDown'} />
          )}
        </TableTitleButton>
      ))}
    </TableContainer>
  </TableHeaderWrapper>
)

const TableHeaderWrapper = styled.div`
  background: var(--box_header--secondary--background-color);
`

const TableContainer = styled.div<{ columns: number; minWidth: number }>`
  display: grid;
  justify-content: space-between;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  padding: calc(var(--spacing-2)) var(--spacing-4) var(--spacing-2);
  min-width: ${({ minWidth }) => `${minWidth}rem`};
`

const TableTitle = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

const TableTitleButton = styled(Button)`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  display: flex;
  align-items: center;
  font-family: var(--font);
  margin-right: auto;
  text-transform: none;
  color: var(--page-text-color);
  &:disabled {
    color: var(--page-text-color);
  }
`

const StyledIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default TableHeader
