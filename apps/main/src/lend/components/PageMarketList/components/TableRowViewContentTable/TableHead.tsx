import { Fragment } from 'react'
import styled from 'styled-components'
import type { TableLabel, PageMarketList, FilterTypeKey } from '@/lend/components/PageMarketList/types'
import useStore from '@/lend/store/useStore'
import { Order, TitleKey } from '@/lend/types/lend.types'
import { _showContent } from '@/lend/utils/helpers'
import { Thead, Th, TheadSortButton } from '@ui/Table'
import type { TheadSortButtonProps } from '@ui/Table/TheadSortButton'

const TableHead = ({
  address,
  filterTypeKey,
  searchParams,
  showBorrowSignerCell,
  showSupplySignerCell,
  tableLabels,
  titleMapper,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'titleMapper' | 'updatePath'> & {
  filterTypeKey: FilterTypeKey
  address: string
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
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
      <Thead>
        <tr>
          {tableLabels.map(({ sortIdKey, className, show, isNotSortable = true }, idx) => {
            const label = titleMapper[sortIdKey].title
            const key = `${sortIdKey}-${idx}`
            const parsedIsNotSortable = tableSetting?.isNotSortable && isNotSortable
            const isFirst = idx === 1 && (filterTypeKey === 'borrow' ? !showBorrowSignerCell : !showSupplySignerCell)
            const isLast = idx === tableLabels.length - 1
            const isVisible = _showContent(show)

            return (
              <Fragment key={key}>
                {isVisible && !label && <Th></Th>}
                {isVisible && label && (
                  <Th className={className} $first={isFirst} $last={isLast}>
                    {parsedIsNotSortable && <Label>{label}</Label>}
                    {!parsedIsNotSortable && (
                      <StyledTheadSortButton
                        {...theadSortButtonProps}
                        indicatorPlacement={className.startsWith('left') ? 'right' : 'left'}
                        className={className}
                        sortIdKey={sortIdKey}
                      >
                        {label}
                      </StyledTheadSortButton>
                    )}
                  </Th>
                )}
              </Fragment>
            )
          })}
        </tr>
      </Thead>
    </>
  )
}

const Label = styled.span`
  align-items: center;
  color: inherit;
  display: inline-flex;
  font-family: var(--table_head--font);
  font-weight: var(--table_head--font-weight);
  font-size: 13.3333px; // keep same as button font size
`

const StyledTheadSortButton = styled(TheadSortButton)`
  min-height: var(--height-medium);
  width: 100%;
  white-space: nowrap;
`

export default TableHead
