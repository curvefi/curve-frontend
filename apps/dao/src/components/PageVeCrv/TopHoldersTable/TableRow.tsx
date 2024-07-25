import styled from 'styled-components'

import networks from '@/networks'
import { shortenTokenAddress, formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils'

import { ExternalLink } from '@/ui/Link'
import LazyItem from '@/ui/LazyItem'

interface TableRowProps {
  holder: VeCrvHolder
  sortBy: AllHoldersSortBy
}

const TableRow: React.FC<TableRowProps> = ({ holder, sortBy }) => {
  return (
    <LazyItem defaultHeight="1.8125rem">
      <TableRowWrapper>
        <TableData>
          <StyledExternalLink href={`${networks[1].scanAddressPath}/address/${holder.user}`}>
            {shortenTokenAddress(holder.user)}
          </StyledExternalLink>
        </TableData>
        <TableData className={sortBy === 'weight' ? 'active left-padding' : 'left-padding'}>
          {formatNumber(holder.weight, { showDecimalIfSmallNumberOnly: true })}
        </TableData>
        <TableData className={sortBy === 'locked' ? 'active left-padding' : 'left-padding'}>
          {formatNumber(holder.locked, { showDecimalIfSmallNumberOnly: true })}
        </TableData>
        <TableData className={sortBy === 'weight_ratio' ? 'active left-padding' : 'left-padding'}>
          {formatNumber(holder.weight_ratio, { showDecimalIfSmallNumberOnly: true })}%
        </TableData>
        <TableData className={sortBy === 'unlock_time' ? 'active left-padding' : 'left-padding'}>
          {formatDateFromTimestamp(convertToLocaleTimestamp(new Date(holder.unlock_time).getTime()))}
        </TableData>
      </TableRowWrapper>
    </LazyItem>
  )
}

const TableRowWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  padding: var(--spacing-1) 0;
  border-bottom: 1px solid var(--gray-500a20);
`

const TableData = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  &.left-padding {
    padding-left: var(--spacing-2);
  }
  &.active {
    font-weight: var(--bold);
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--page--text-color);
  text-transform: none;
`

export default TableRow
