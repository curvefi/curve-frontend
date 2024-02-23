import type { MarketListItem, PageMarketList, TableLabel, TableRowSettings } from '@/components/PageMarketList/types'
import type { NavigateFunction, Params } from 'react-router-dom'

import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import TableRowViewContentTable from '@/components/PageMarketList/components/TableRowViewContentTable'

const MarketListItemContentBody = ({
  params,
  navigate,
  marketListItem,
  showSignerCell,
  tableLabels,
  tableRowSettings,
  ...pageProps
}: PageMarketList & {
  params: Params
  navigate: NavigateFunction
  marketListItem: MarketListItem
  showSignerCell: boolean
  tableLabels: TableLabel[]
  tableRowSettings: TableRowSettings
}) => {
  const { rChainId, api, searchParams } = pageProps
  const { address } = marketListItem
  const { signerAddress } = api ?? {}

  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const updateTableRowSettings = useStore((state) => state.marketList.updateTableRowSettings)

  const { isOpen } = tableRowSettings ?? {}

  const someLoanExists = useMemo(
    () => (signerAddress ? _getSomeLoansExists(loansExistsMapper) : false),
    [signerAddress, loansExistsMapper]
  )

  useEffect(() => {
    if (isOpen) {
      updateTableRowSettings(rChainId, api, searchParams, address, {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <FoldContentWrapper isOpen={isOpen ?? true}>
      <TableRowViewContentTable
        {...pageProps}
        params={params}
        navigate={navigate}
        marketListItem={marketListItem}
        someLoanExists={someLoanExists}
        showSignerCell={showSignerCell}
        tableRowSettings={tableRowSettings}
        tableLabels={tableLabels}
      />
    </FoldContentWrapper>
  )
}

const FoldContentWrapper = styled.div<{ isOpen: boolean }>`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-in-out; /* Add transition for max-height */

  ${({ isOpen }) => {
    if (isOpen) {
      return `
        max-height: 1000px; /* Set a large value for max-height to accommodate content */
        border: 1px solid var(--box_header--primary--background-color);
        box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
        margin: 0 var(--spacing-narrow);
  
        @media (min-width: ${breakpoints.sm}rem) {
          margin: 0 var(--spacing-normal);
        }
      `
    }
  }}
`

function _getSomeLoansExists(loanExistsMapper: UsersLoansExistsMapper) {
  return Object.values(loanExistsMapper).some(({ loanExists }) => loanExists)
}

export default MarketListItemContentBody
