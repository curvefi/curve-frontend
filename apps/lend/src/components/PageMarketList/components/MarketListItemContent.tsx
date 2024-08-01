import type { MarketListItemResult, PageMarketList, TableLabel } from '@/components/PageMarketList/types'

import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import MarketListTable from '@/components/PageMarketList/components/TableRowViewContentTable'
import MarketListItemHeader from '@/components/PageMarketList/components/MarketListItemHeader'

const MarketListItemContent = ({
  pageProps,
  marketListItem,
  ...props
}: {
  pageProps: PageMarketList
  marketListItem: MarketListItemResult
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  tableLabels: TableLabel[]
}) => {
  const { rChainId } = pageProps
  const { address } = marketListItem

  const tableSettings = useStore((state) => state.marketList.tableRowsSettings[address])

  if (address === 'all') {
    return <MarketListTable {...props} pageProps={pageProps} {...marketListItem} tableSettings={tableSettings} />
  }

  return (
    <>
      <MarketListItemHeader rChainId={rChainId} {...marketListItem} />
      <TableWrapper>
        <MarketListTable {...props} pageProps={pageProps} {...marketListItem} tableSettings={tableSettings} />
      </TableWrapper>
    </>
  )
}

const TableWrapper = styled.div`
  border: 1px solid var(--box_header--primary--background-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);

  @media (min-width: ${breakpoints.xs}rem) {
    margin: 0 var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 0 var(--spacing-normal);
  }
`

export default MarketListItemContent
