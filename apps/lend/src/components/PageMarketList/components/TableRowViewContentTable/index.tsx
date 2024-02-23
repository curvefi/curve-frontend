import type {
  MarketListItem,
  PageMarketList,
  TableLabel,
  TableRowProps,
  TableRowSettings,
} from '@/components/PageMarketList/types'
import type { Params, NavigateFunction } from 'react-router-dom'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Table from '@/ui/Table'
import TableHead from '@/components/PageMarketList/components/TableRowViewContentTable/TableHead'
import TableHeadMobile from '@/components/PageMarketList/components/TableRowViewContentTable/TableHeadMobile'
import TableRow from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import TableRowMobile from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowMobile'
import TextCaption from '@/ui/TextCaption'

const TableRowViewContentTable = ({
  params,
  navigate,
  someLoanExists,
  marketListItem,
  showSignerCell,
  tableLabels,
  tableRowSettings,
  ...pageProps
}: Pick<PageMarketList, 'rChainId' | 'api' | 'isBorrow' | 'searchParams' | 'tableLabelsMapper' | 'updatePath'> & {
  params: Params
  navigate: NavigateFunction
  marketListItem: MarketListItem
  someLoanExists: boolean
  showSignerCell: boolean
  tableLabels: TableLabel[]
  tableRowSettings: TableRowSettings
}) => {
  const { rChainId, api, isBorrow, searchParams, tableLabelsMapper } = pageProps

  const { address } = marketListItem
  const { borrowKey = searchParams.borrowKey } = tableRowSettings ?? {}

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const owmDatasCachedMapper = useStore((state) => state.storeCache.owmDatasMapper[rChainId])
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[rChainId])
  const result = useStore((state) => state.marketList.tokenResult[address]?.[borrowKey])
  const setMarketsStateByKey = useStore((state) => state.markets.setStateByKey)

  const defaultTableProps: TableRowProps = {
    rChainId,
    api,
    owmId: '',
    owmDataCachedOrApi: undefined,
    isBorrow,
    loanExists: false,
    searchParams,
    showSignerCell,
    userActiveKey: '',
    handleCellClick: () => {},
  }

  return (
    <MarketContentTable>
      {isMdUp ? (
        <TableHead {...pageProps} address={address} tableLabels={tableLabels} tableRowSettings={tableRowSettings} />
      ) : (
        <TableHeadMobile />
      )}
      <tbody>
        {typeof result === 'undefined' ? (
          isMdUp ? (
            <TableRow {...defaultTableProps} />
          ) : (
            <TableRowMobile {...defaultTableProps} tableLabelsMapper={tableLabelsMapper} />
          )
        ) : Array.isArray(result) && result.length > 0 ? (
          result.map((owmId) => {
            const owmDataCached = owmDatasCachedMapper?.[owmId]
            const owmData = owmDatasMapper?.[owmId]
            const owmDataCachedOrApi = owmData ?? owmDataCached
            const userActiveKey = helpers.getUserActiveKey(api, owmDataCachedOrApi)
            const loanExists = loansExistsMapper[userActiveKey]?.loanExists

            const handleCellClick = () => {
              setMarketsStateByKey('marketDetailsView', 'market')
              if (searchParams.filterTypeKey === 'supply') {
                navigate(getVaultPathname(params, owmId, 'deposit'))
              } else if (loanExists) {
                navigate(getLoanManagePathname(params, owmId, 'loan'))
              } else {
                navigate(getLoanCreatePathname(params, owmId, 'create'))
              }
            }

            const tableRowProps: TableRowProps = {
              rChainId,
              api,
              owmId,
              owmDataCachedOrApi,
              isBorrow,
              loanExists,
              searchParams,
              showSignerCell,
              userActiveKey,
              handleCellClick,
            }

            return isMdUp ? (
              <TableRow key={owmId} {...tableRowProps} />
            ) : (
              <TableRowMobile key={owmId} {...tableRowProps} tableLabelsMapper={tableLabelsMapper} />
            )
          })
        ) : (
          <tr>
            <td colSpan={tableLabels.length + 1}>
              <Box flex flexJustifyContent="center" fillWidth padding="var(--spacing-normal)">
                <TextCaption isCaps isBold>{t`No market found`}</TextCaption>
              </Box>
            </td>
          </tr>
        )}
      </tbody>
    </MarketContentTable>
  )
}

const MarketContentTable = styled(Table)`
  background-color: var(--tab-secondary--background-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);

  th,
  th button {
    align-items: flex-end;
    vertical-align: bottom;
    font-size: var(--font-size-2);
  }

  thead {
    border-bottom: 1px solid var(--border-400);
  }

  .active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }

  .border-left {
    border-left: 1px solid var(--border-400);
  }

  .border-right {
    border-right: 1px solid var(--border-400);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    tbody > tr:not(:last-of-type) {
      border-bottom: 1px solid var(--border-400);
    }

    tbody > td:not(:last-of-type),
    thead > th:not(:last-of-type) {
      padding-left: var(--spacing-1);
      padding-right: var(--spacing-1);
    }

    tr.row--info td,
    th {
      height: 1px;
      line-height: 1;

      &.center {
        text-align: center;
      }
    }
  }
`

export default TableRowViewContentTable
