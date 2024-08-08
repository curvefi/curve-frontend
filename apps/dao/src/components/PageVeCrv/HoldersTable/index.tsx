import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { shortenTokenAddress, formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils'

import PaginatedTable, { Column } from '@/components/PaginatedTable'
import { TableRowWrapper, TableData } from '@/components/PaginatedTable/TableRow'
import { InternalLink } from '@/ui/Link'
import Box from '@/ui/Box'

const TopHoldersTable: React.FC = () => {
  const { veCrvHolders, allHoldersSortBy, setAllHoldersSortBy, getVeCrvHolders } = useStore((state) => state.vecrv)

  const tableMinWidth = 41.875

  const holdersArray = Object.values(veCrvHolders.allHolders)

  const HOLDERS_LABELS: Column<VeCrvHolder>[] = [
    { key: 'user', label: 'Holder', disabled: true },
    { key: 'weight', label: 'veCRV' },
    { key: 'locked', label: 'CRV Locked' },
    { key: 'weight_ratio', label: '% veCRV' },
    { key: 'unlock_time', label: 'Unlock Time' },
  ]

  return (
    <Wrapper>
      <PaginatedTable
        data={holdersArray}
        minWidth={tableMinWidth}
        fetchingState={veCrvHolders.fetchStatus ?? 'LOADING'}
        columns={HOLDERS_LABELS}
        sortBy={allHoldersSortBy}
        title=""
        errorMessage={t`An error occurred while veCRV holders data.`}
        setSortBy={(key) => setAllHoldersSortBy(key as AllHoldersSortBy)}
        getData={() => getVeCrvHolders()}
        renderRow={(holder, index) => (
          <TableRowWrapper key={holder.user} minWidth={tableMinWidth} columns={HOLDERS_LABELS.length}>
            <TableData>
              {index + 1}.
              <StyledInternalLink href={`/ethereum/user/${holder.user}`}>
                {shortenTokenAddress(holder.user)}
              </StyledInternalLink>
            </TableData>
            <TableData className={allHoldersSortBy.key === 'weight' ? 'active left-padding' : 'left-padding'}>
              {formatNumber(holder.weight, { showDecimalIfSmallNumberOnly: true })}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'locked' ? 'active left-padding' : 'left-padding'}>
              {formatNumber(holder.locked, { showDecimalIfSmallNumberOnly: true })}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'weight_ratio' ? 'active left-padding' : 'left-padding'}>
              {formatNumber(holder.weight_ratio, { style: 'percent' })}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'unlock_time' ? 'active left-padding' : 'left-padding'}>
              {formatDateFromTimestamp(convertToLocaleTimestamp(new Date(holder.unlock_time).getTime()))}
            </TableData>
          </TableRowWrapper>
        )}
      />
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 46.875rem;
  padding-bottom: var(--spacing-3);
  width: 100%;
`

const StyledInternalLink = styled(InternalLink)`
  color: inherit;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  text-decoration: none;
  text-transform: none;
  display: flex;
  flex-direction: column;
`

export default TopHoldersTable
