import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'
import type { Order, SearchParams, TableLabel } from '@/components/PageMarketList/types'

import styled from 'styled-components'

import { TITLE } from '@/constants'
import useStore from '@/store/useStore'

import { Th, Thead, TheadSortButton } from '@/ui/Table'
import TooltipIcon from '@/ui/Tooltip/TooltipIcon'

const TableHead = ({
  someLoanExists,
  tableLabels,
  titleMapper,
  updatePath,
}: {
  someLoanExists: boolean
  tableLabels: TableLabel[]
  titleMapper: TitleMapper
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const searchParams = useStore((state) => state.collateralList.searchParams)

  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    updatePath({ sortBy: sortBy as TitleKey, sortByOrder })
  }

  const theadBtnProps: Omit<TheadSortButtonProps<TitleKey>, 'loading' | 'sortIdKey'> = {
    ...searchParams,
    handleBtnClickSort,
  }

  return (
    <>
      <colgroup>
        {tableLabels.map(({ width, show }, idx) => {
          if (typeof show !== 'undefined' && !show) return null

          return <col key={`col${idx}`} {...(width ? { width } : {})} />
        })}
      </colgroup>
      <Thead>
        <tr>
          {tableLabels.map(({ titleKey, className, width, show, ...props }, idx) => {
            const { title, tooltip, tooltipProps = {} } = titleMapper[titleKey]
            const key = `thead${idx}`

            if (typeof show !== 'undefined' && !show) return null
            if (titleKey === TITLE.isInMarket) {
              return (
                <Th key={key} className="in-pool">
                  {' '}
                </Th>
              )
            }

            return (
              <Th
                key={key}
                $first={!someLoanExists && titleKey === TITLE.name}
                $last={titleKey === TITLE.totalCollateral}
                className={className}
              >
                <StyledTheadSortButton className={className} sortIdKey={titleKey} {...theadBtnProps} {...props}>
                  {title}{' '}
                  {tooltip && (
                    <TooltipWrapper>
                      <TooltipIcon {...tooltipProps}>{tooltip}</TooltipIcon>
                    </TooltipWrapper>
                  )}
                </StyledTheadSortButton>
              </Th>
            )
          })}
        </tr>
      </Thead>
    </>
  )
}

const StyledTheadSortButton = styled(TheadSortButton)`
  min-height: var(--height-medium);
  white-space: nowrap;
  width: 100%;
`

const TooltipWrapper = styled.span`
  white-space: initial;
`

export default TableHead
