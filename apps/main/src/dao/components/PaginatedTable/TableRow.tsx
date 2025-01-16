import type { InternalLinkProps } from '@/ui/Link/InternalLink'

import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import { InternalLink } from '@/ui/Link'

interface TableRowProps {
  holder: any
  sortBy: { key: string; label: string; order: 'asc' | 'desc' }
  labels: { key: string; label: string }[]
  rank: number
  gridTemplateColumns?: string
}

const TableRow: React.FC<TableRowProps> = ({ holder, sortBy, labels, rank, gridTemplateColumns }) => (
  <TableRowWrapper columns={labels.length} gridTemplateColumns={gridTemplateColumns}>
    {labels.map((label, index) => (
      <TableData key={index} className={sortBy.key === label.key ? 'active left-padding' : 'left-padding'}>
        {formatNumber(holder[label.key], { showDecimalIfSmallNumberOnly: true })}
      </TableData>
    ))}
  </TableRowWrapper>
)

export const TableRowWrapper = styled.div<{ columns: number; gridTemplateColumns?: string }>`
  display: grid;
  grid-template-columns: ${({ columns, gridTemplateColumns }) =>
    gridTemplateColumns ? gridTemplateColumns : `repeat(${columns}, 1fr)`};
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
  &:last-child {
    border-bottom: none;
  }
`

export const TableData = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  display: flex;
  gap: var(--spacing-1);
  margin-left: auto;
  &.right-padding {
    padding-right: var(--spacing-2);
  }
  &.capitalize {
    text-transform: capitalize;
  }
  &.sortby-active {
    font-weight: var(--bold);
  }
  &.align-left {
    margin-right: auto;
    margin-left: 0;
    padding-left: var(--spacing-2);
  }
`

export const TableDataLink = styled(InternalLink)<InternalLinkProps>`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  display: flex;
  gap: var(--spacing-1);
  text-decoration: none;
  color: inherit;
  text-transform: none;
  margin-left: auto;
  text-decoration: underline;
  &.right-padding {
    padding-right: var(--spacing-2);
  }
  &.capitalize {
    text-transform: capitalize;
  }
  &.sortby-active {
    font-weight: var(--bold);
  }
  &.align-left {
    margin-right: auto;
    margin-left: 0;
    padding-left: var(--spacing-2);
  }
`

export default TableRow
