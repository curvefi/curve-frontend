import styled from 'styled-components'
import PaginatedTable, { Column } from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/dao/components/PaginatedTable/TableRow'
import { TOP_HOLDERS } from '@/dao/constants'
import useStore from '@/dao/store/useStore'
import type { AllHoldersSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import type { Locker } from '@curvefi/prices-api/dao'
import Box from '@ui/Box'
import { shortenTokenAddress, formatNumber, formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'

const TopHoldersTable = () => {
  const { veCrvHolders, allHoldersSortBy, setAllHoldersSortBy, getVeCrvHolders } = useStore((state) => state.analytics)

  const tableMinWidth = 41.875

  const holdersArray = Object.values(veCrvHolders.allHolders)

  const HOLDERS_LABELS: Column<Locker>[] = [
    { key: 'user', label: 'Holder', disabled: true },
    { key: 'weight', label: 'veCRV' },
    { key: 'locked', label: 'CRV Locked' },
    { key: 'weightRatio', label: '% veCRV' },
    { key: 'unlockTime', label: 'Unlock Time' },
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
            <StyledTableDataLink className="align-left" href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${holder.user}`)}>
              <span>{index + 1}.</span>
              <span style={{ textDecoration: 'underline' }}>
                {TOP_HOLDERS[holder.user.toLowerCase()]
                  ? TOP_HOLDERS[holder.user.toLowerCase()].title
                  : shortenTokenAddress(holder.user)}
              </span>
            </StyledTableDataLink>
            <TableData className={allHoldersSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.weight.fromWei(), { notation: 'compact' })}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'locked' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.locked.fromWei(), { notation: 'compact' })}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'weightRatio' ? 'sortby-active right-padding' : 'right-padding'}
            >
              {formatNumber(holder.weightRatio, { style: 'percent', notation: 'compact' })}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'unlockTime' ? 'sortby-active right-padding' : 'right-padding'}
            >
              {holder.unlockTime ? formatDate(holder.unlockTime) : 'N/A'}
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
