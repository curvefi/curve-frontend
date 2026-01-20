import { styled } from 'styled-components'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'

interface TableHeaderProps<T> {
  columns: { key: keyof T; label: string; disabled?: boolean }[]
  title?: string
  sortBy: { key: keyof T; order: 'asc' | 'desc' }
  setSortBy: (key: keyof T) => void
  smallScreenBreakpoint?: number
  gridTemplateColumns?: string
}

export const TableHeader = <T,>({
  columns,
  title,
  sortBy,
  setSortBy,
  gridTemplateColumns,
  smallScreenBreakpoint,
}: TableHeaderProps<T>) => (
  <TableHeaderWrapper noTitle={title === undefined} smallScreenBreakpoint={smallScreenBreakpoint}>
    {title && <TableTitle>{title}</TableTitle>}
    <TableContainer columns={columns.length} gridTemplateColumns={gridTemplateColumns}>
      {columns.map((column, index) => (
        <TableTitleButton
          disabled={column.disabled}
          key={column.key as string}
          variant="text"
          onClick={() => !column.disabled && setSortBy(column.key)}
          className={index === 0 ? 'align-left' : ''}
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

const TableHeaderWrapper = styled.div<{ noTitle: boolean; smallScreenBreakpoint?: number }>`
  background-color: var(--box--secondary--content--background-color);
  padding: ${({ noTitle }) => (noTitle ? 'var(--spacing-3)' : '0')} 0 0 0;
  @media (max-width: ${({ smallScreenBreakpoint }) => `${smallScreenBreakpoint}rem`}) {
    display: none;
  }
`

const TableContainer = styled.div<{ columns: number; gridTemplateColumns?: string }>`
  display: grid;
  justify-content: space-between;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  padding: calc(var(--spacing-2)) var(--spacing-3) var(--spacing-2);
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`

const TableTitle = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  /* border-bottom: 1px solid var(--gray-500a20); */
`

const TableTitleButton = styled(Button)`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  line-height: 1.5;
  display: flex;
  align-items: bottom;
  font-family: var(--font);
  text-transform: none;
  color: var(--page-text-color);
  margin: 0 0 0 auto;
  align-items: center;
  &.align-left {
    margin: 0 auto 0 0;
  }
  &:disabled {
    color: var(--page-text-color);
  }
`

const StyledIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-1);
`
