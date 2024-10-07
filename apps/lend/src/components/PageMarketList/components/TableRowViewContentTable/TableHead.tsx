import { TheadSortButton } from '@/ui/Table'
import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'
import React from 'react'
import styled from 'styled-components'
import { cellCss } from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import type { TableLabel, PageMarketList } from '@/components/PageMarketList/types'


import useStore from '@/store/useStore'
import { _showContent } from '@/utils/helpers'


const TableHead = ({
  address,
  searchParams,
  tableLabels,
  titleMapper,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'titleMapper' | 'updatePath'> & {
  address: string
  tableLabels: TableLabel[]
}) => {
  const formStatus = useStore((state) => state.marketList.formStatus)
  const tableSetting = useStore((state) => state.marketList.tableRowsSettings[address])

  const rowSearchParams = address === 'all' ? searchParams : { ...(tableSetting ?? {}), ...searchParams }

  const theadSortButtonProps: Omit<TheadSortButtonProps<TitleKey>, 'sortIdKey'> = {
    loading: formStatus.isLoading,
    sortBy: rowSearchParams?.sortBy ?? '',
    sortByOrder: rowSearchParams?.sortByOrder ?? 'desc',
    handleBtnClickSort: (sortBy: string, sortByOrder: Order) => updatePath({ sortBy: sortBy as TitleKey, sortByOrder }),
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
          {tableLabels.map(({ sortIdKey, className, show, isNotSortable = true, ...props }, idx) => {
            if (!_showContent(show)) return null

            const label = titleMapper[sortIdKey].title
            const key = `${sortIdKey}-${idx}`
            const parsedIsNotSortable = tableSetting?.isNotSortable && isNotSortable

            if (!label) return <Th key={key}></Th>

            return (
              <Th key={key} className={className}>
                {parsedIsNotSortable && label}

                {!parsedIsNotSortable && (
                  <StyledTheadSortButton
                    {...theadSortButtonProps}
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
