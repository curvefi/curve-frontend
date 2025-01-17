import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { shortenTokenAddress, formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils'
import { TOP_HOLDERS } from '@/constants'

import PaginatedTable, { Column } from '@/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/components/PaginatedTable/TableRow'
import Box from '@/ui/Box'
import { VeCrvHolder, AllHoldersSortBy } from '@/types/dao.types'

const TopHoldersTable: React.FC = () => {
  const { veCrvHolders, allHoldersSortBy, setAllHoldersSortBy, getVeCrvHolders } = useStore((state) => state.analytics)

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
        errorMessage={t`An error occurred while veCRV holders data.`}
        setSortBy={(key) => setAllHoldersSortBy(key as AllHoldersSortBy)}
        getData={() => getVeCrvHolders()}
        noDataMessage={t`No veCRV holders found.`}
        renderRow={(holder, index) => (
          <TableRowWrapper key={holder.user} columns={HOLDERS_LABELS.length}>
            <StyledTableDataLink className="align-left" href={`/ethereum/user/${holder.user}`}>
              <span>{index + 1}.</span>
              <span style={{ textDecoration: 'underline' }}>
                {TOP_HOLDERS[holder.user.toLowerCase()]
                  ? TOP_HOLDERS[holder.user.toLowerCase()].title
                  : shortenTokenAddress(holder.user)}
              </span>
            </StyledTableDataLink>
            <TableData className={allHoldersSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.weight, { notation: 'compact' })}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'locked' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.locked, { notation: 'compact' })}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'weight_ratio' ? 'sortby-active right-padding' : 'right-padding'}
            >
              {formatNumber(holder.weight_ratio, { style: 'percent', notation: 'compact' })}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'unlock_time' ? 'sortby-active right-padding' : 'right-padding'}
            >
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
  padding-bottom: var(--spacing-3);
  width: 100%;
`

const StyledTableDataLink = styled(TableDataLink)`
  text-decoration: none;
`

export default TopHoldersTable
