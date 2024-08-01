import type { TableLabel, PageMarketList, SortKey } from '@/components/PageMarketList/types'

import React from 'react'
import styled from 'styled-components'

import { _showContent } from '@/utils/helpers'
import useStore from '@/store/useStore'

import { cellCss } from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import { TheadSortButton } from '@/ui/Table'

interface TheadBtnProps {
  align: string[]
  loading: boolean
  sortBy: string
  sortByOrder: Order
  handleBtnClickSort: (sortBy: string, sortByOrder: Order) => void
}

const TableHead = ({
  address,
  searchParams,
  tableLabels,
  tableLabelsMapper,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'tableLabelsMapper' | 'updatePath'> & {
  address: string
  tableLabels: TableLabel[]
}) => {
  const formStatus = useStore((state) => state.marketList.formStatus)
  const tableSetting = useStore((state) => state.marketList.tableRowsSettings[address])

  const rowSearchParams = address === 'all' ? searchParams : { ...(tableSetting ?? {}), ...searchParams }

  const props: TheadBtnProps = {
    align: ['left', 'end'],
    loading: formStatus.isLoading,
    sortBy: rowSearchParams?.sortBy ?? '',
    sortByOrder: rowSearchParams?.sortByOrder ?? 'desc',
    handleBtnClickSort: (sortBy: string, sortByOrder: Order) => updatePath({ sortBy: sortBy as SortKey, sortByOrder }),
  }

  return (
    <>
      <colgroup>
        {tableLabels.map(({ sortIdKey, className, width, show }, idx) => {
          if (!_showContent(show)) return null

          return <col key={`${sortIdKey}-${idx}`} className={className} {...(width ? { style: { width } } : {})} />
        })}
      </colgroup>
      <thead>
        <tr>
          {tableLabels.map(({ sortIdKey, className, show, isNotSortable = true }, idx) => {
            if (!_showContent(show)) return null

            const label = tableLabelsMapper[sortIdKey].name
            const key = `${sortIdKey}-${idx}`
            const parsedIsNotSortable = tableSetting?.isNotSortable && isNotSortable

            if (!label) return <Th key={key}></Th>

            return (
              <Th key={key} className={className}>
                {parsedIsNotSortable && label}

                {!parsedIsNotSortable && (
                  <StyledTheadSortButton
                    {...props}
                    indicatorPlacement={className.startsWith('left') ? 'right' : 'left'}
                    className={className}
                    sortIdKey={sortIdKey}
                  >
                    {label}
                  </StyledTheadSortButton>
                )}
              </Th>
            )
          })}
        </tr>
      </thead>
    </>
  )
}

const Th = styled.th`
  ${cellCss};
`

const StyledTheadSortButton = styled(TheadSortButton)`
  width: 100%;
  white-space: nowrap;
`

export default TableHead
