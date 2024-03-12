import type { MarketListItem, PageMarketList } from '@/components/PageMarketList/types'

import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'

import TableHeadCellTokenLabel from '@/components/PageMarketList/components/TableRowViewContentTable/TableHeadCellTokenLabel'

const MarketListItemHeader = ({
  rChainId,
  marketListItem,
}: Pick<PageMarketList, 'rChainId'> & {
  marketListItem: MarketListItem
}) => {
  const { address, symbol } = marketListItem

  return (
    <Wrapper>
      <TableHeadCellTokenLabel rChainId={rChainId} address={address} symbol={symbol} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-1) var(--spacing-narrow);
  padding-top: var(--spacing-wide);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
}
`

export default MarketListItemHeader
