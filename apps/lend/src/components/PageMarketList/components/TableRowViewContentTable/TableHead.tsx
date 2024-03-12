import type { IndicatorPlacement } from '@/ui/Table/types'
import type { TableLabel, TableLabelsMapper, TableRowSettings } from '@/components/PageMarketList/types'
import type { Order, PageMarketList } from '@/components/PageMarketList/types'

import React from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'

import { TheadSortButton } from '@/ui/Table'
import Box from '@/ui/Box'

interface TheadBtnProps {
  align: string[]
  indicatorPlacement: IndicatorPlacement
  sortBy: string
  sortByOrder: Order
  handleBtnClickSort: (sortBy: string, sortByOrder: Order) => void
}

const TableHead = ({
  rChainId,
  api,
  address,
  searchParams,
  tableLabels,
}: Pick<PageMarketList, 'rChainId' | 'api' | 'searchParams' | 'updatePath'> & {
  address: string
  tableLabels: TableLabel[]
  tableRowSettings: TableRowSettings
}) => {
  const tokenSearchParams = useStore((state) => state.marketList.tokenSearchParams[address])
  const updateTableRowSettings = useStore((state) => state.marketList.updateTableRowSettings)

  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    updateTableRowSettings(rChainId, api, searchParams, address, {
      sortBy: sortBy as keyof TableLabelsMapper,
      sortByOrder,
    })
  }

  const props: TheadBtnProps = {
    align: ['left', 'end'],
    indicatorPlacement: 'left',
    sortBy: tokenSearchParams?.sortBy,
    sortByOrder: tokenSearchParams?.sortByOrder,
    handleBtnClickSort,
  }

  return (
    <>
      <colgroup>
        {tableLabels.map(({ sortIdKey, className, width, show }) => {
          const showCell = typeof show === 'undefined' || (typeof show !== 'undefined' && show)

          return showCell && <col key={sortIdKey} className={className} {...(width ? { style: { width } } : {})} />
        })}
      </colgroup>
      <thead>
        <tr>
          {tableLabels.map(({ sortIdKey, label, buttons, className, show, isNotSortable }) => {
            const showCell = typeof show === 'undefined' || (typeof show !== 'undefined' && show)

            return (
              showCell && (
                <Th key={sortIdKey || label} className={className}>
                  {isNotSortable ? (
                    label
                  ) : typeof buttons !== 'undefined' ? (
                    <>
                      {/* TODO: add sortIdKey once ready */}
                      <Box margin="0 0 var(--spacing-1) 0">{label}</Box>
                      <Box flex flexAlignItems="center" flexJustifyContent="flex-end" gridGap={1}>
                        {buttons.map(({ sortIdKey, label }, idx) => {
                          const isNotLast = idx !== buttons.length - 1
                          return (
                            <React.Fragment key={sortIdKey}>
                              <TheadSortButton className={className} disabled sortIdKey={''} {...props} loading={false}>
                                {label}
                              </TheadSortButton>{' '}
                              {isNotLast && '+'}{' '}
                            </React.Fragment>
                          )
                        })}
                      </Box>
                    </>
                  ) : (
                    <StyledTheadSortButton className={className} disabled sortIdKey={''} {...props} loading={false}>
                      {label}
                    </StyledTheadSortButton>
                  )}
                </Th>
              )
            )
          })}
        </tr>
      </thead>
    </>
  )
}

const Th = styled.th`
  padding: var(--spacing-1);
  padding-top: var(--spacing-2);

  &.noPadding {
    padding: 0;
  }
`

const StyledTheadSortButton = styled(TheadSortButton)`
  width: 100%;
`

export default TableHead
