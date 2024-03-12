import type { MarketListItem, PageMarketList, TableRowSettings } from '@/components/PageMarketList/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import TableHeadCellTokenLabel from '@/components/PageMarketList/components/TableRowViewContentTable/TableHeadCellTokenLabel'

import useStore from '@/store/useStore'

const MarketListItemHeader = ({
  rChainId,
  api,
  searchParams,
  marketListItem,
  tableRowSettings,
}: Pick<PageMarketList, 'rChainId' | 'api' | 'searchParams'> & {
  isLastItem: boolean
  marketListItem: MarketListItem
  tableRowSettings: TableRowSettings
}) => {
  const { address, symbol } = marketListItem

  const updateTableRowSettings = useStore((state) => state.marketList.updateTableRowSettings)

  const TABS = [
    { key: 'long', label: t`Long` },
    { key: 'short', label: t`Short` },
  ] as const

  return (
    <Wrapper>
      <TableHeadCellTokenLabel rChainId={rChainId} address={address} symbol={symbol} />
      <Box as="span" margin="0 0 0 var(--spacing-1)">
        {TABS.map(({ key, label }, idx) => {
          const borrowKey = tableRowSettings?.borrowKey ?? searchParams.borrowKey
          return (
            <React.Fragment key={key}>
              <LongShortButton
                variant="text"
                className={borrowKey === key ? 'active' : ''}
                disabled={borrowKey === key}
                onClick={() => updateTableRowSettings(rChainId, api, searchParams, address, { borrowKey: key })}
              >
                {label}
              </LongShortButton>
              {idx !== TABS.length - 1 ? '|' : ''}
            </React.Fragment>
          )
        })}
      </Box>
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

export const LongShortButton = styled(Button)`
  color: var(--page--text-color);
  border-bottom: 3px solid transparent;
  font-size: var(--font-size-2);
  padding: 0;
  margin: 0 var(--spacing-2);
  margin-top: var(--spacing-1);
  text-transform: uppercase;

  &.active {
    color: var(--page--text-color);
    border-bottom: 3px solid var(--page--text-color);
  }
`

export default MarketListItemHeader
