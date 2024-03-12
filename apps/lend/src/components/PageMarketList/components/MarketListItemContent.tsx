import type { MarketListItem, PageMarketList, TableLabel } from '@/components/PageMarketList/types'
import type { NavigateFunction } from 'react-router-dom'

import React from 'react'
import useStore from '@/store/useStore'

import MarketListItemHeader from '@/components/PageMarketList/components/MarketListItemHeader'
import MarketListItemContentBody from '@/components/PageMarketList/components/MarketListItemContentBody'

const MarketListItemContent = ({
  navigate,
  pageProps,
  marketListItem,
  showSignerCell,
  tableLabels,
}: {
  navigate: NavigateFunction
  pageProps: PageMarketList
  marketListItem: MarketListItem
  showSignerCell: boolean
  tableLabels: TableLabel[]
}) => {
  const { address } = marketListItem

  const tableRowSettings = useStore((state) => state.marketList.tableRowsSettings[address])

  return (
    <React.Fragment>
      <MarketListItemHeader {...pageProps} marketListItem={marketListItem} />
      <MarketListItemContentBody
        {...pageProps}
        navigate={navigate}
        marketListItem={marketListItem}
        tableRowSettings={tableRowSettings}
        showSignerCell={showSignerCell}
        tableLabels={tableLabels}
      />
    </React.Fragment>
  )
}

export default MarketListItemContent
