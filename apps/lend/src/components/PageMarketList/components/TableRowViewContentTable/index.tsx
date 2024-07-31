import type { TableProps } from '@/components/PageMarketList/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Table from '@/ui/Table'
import TableHead from '@/components/PageMarketList/components/TableRowViewContentTable/TableHead'
import TableHeadMobile from '@/components/PageMarketList/components/TableRowViewContentTable/TableHeadMobile'
import TableRowContainer from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowContainer'
import TextCaption from '@/ui/TextCaption'

const MarketListTable = ({ pageProps, address, markets, tableLabels, tableSettings, ...rest }: TableProps) => {
  const { searchParams } = pageProps
  const { filterTypeKey } = searchParams

  const isMdUp = useStore((state) => state.layout.isMdUp)

  return (
    <MarketContentTable isAllMarkets={address === 'all'}>
      {/* TABLE HEAD */}
      {isMdUp && <TableHead {...pageProps} address={address} tableLabels={tableLabels} />}
      {!isMdUp && <TableHeadMobile />}

      {/* TABLE BODY */}
      <tbody>
        {Array.isArray(markets) && markets.length > 0 ? (
          markets.map((owmId, idx) => (
            <TableRowContainer
              key={`${owmId}${idx}${filterTypeKey}`}
              {...pageProps}
              {...rest}
              owmId={owmId}
              filterTypeKey={filterTypeKey}
            />
          ))
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

const MarketContentTable = styled(Table)<{ isAllMarkets: boolean }>`
  background-color: var(--tab-secondary--background-color);

  ${({ isAllMarkets }) => {
    if (isAllMarkets)
      return `
        border-bottom: 1px solid var(--border-400);
        margin-top: var(--spacing-normal);
      `

    return `box-shadow: 3px 3px 0 var(--box--primary--shadow-color);`
  }}

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

    thead > tr > th:first-of-type:not(.noPadding),
    tbody > tr > td:first-of-type:not(.noPadding) {
      padding-left: var(--spacing-narrow);
    }

    thead > tr > th:last-of-type:not(.noPadding),
    tbody > tr > td:last-of-type:not(.noPadding) {
      padding-right: var(--spacing-narrow);
    }

    tbody > td:not(:last-of-type),
    thead > th:not(:last-of-type) {
      padding-left: var(--spacing-1);
      padding-right: var(--spacing-1);
    }

    tr.row--info td,
    th {
      height: 45px;
      line-height: 1;

      &.center {
        text-align: center;
      }
    }
  }
`

export default MarketListTable
