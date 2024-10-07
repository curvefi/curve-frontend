import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'
import type { FormValues, Order, SortKey } from '@/components/PageMarketList/types'

import styled from 'styled-components'

import { TITLE } from '@/constants'

import { TheadSortButton } from '@/ui/Table'
import TooltipIcon from '@/ui/Tooltip/TooltipIcon'

type Content = {
  titleKey: TitleKey
  className: string
  show?: boolean
  width?: string
  indicatorPlacement?: TheadSortButtonProps<TitleKey>['indicatorPlacement']
}

const TableHead = ({
  formValues,
  isReadyDetail,
  someLoanExists,
  titleMapper,
  updateFormValues,
}: {
  formValues: FormValues
  isReadyDetail: boolean
  someLoanExists: boolean
  titleMapper: TitleMapper
  updateFormValues: (formValues: Partial<FormValues>) => void
}) => {
  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    const updatedFormValues = { sortBy: sortBy as SortKey, sortByOrder }
    updateFormValues(updatedFormValues)
  }

  const theadBtnProps: Omit<TheadSortButtonProps<TitleKey>, 'loading' | 'sortIdKey'> = {
    sortBy: formValues.sortBy,
    sortByOrder: formValues.sortByOrder,
    handleBtnClickSort,
  }

  // prettier-ignore
  const contents: Content[] = [
    { titleKey: TITLE.isInMarket, show: someLoanExists, className: 'left', width: '20px' },
    { titleKey: TITLE.name, className: 'left', width: '150px', indicatorPlacement: 'right' },
    { titleKey: TITLE.myHealth, show: someLoanExists, className: 'right', width: '120px' },
    { titleKey: TITLE.myDebt, show: someLoanExists, className: 'right', width: '120px' },
    { titleKey: TITLE.rate, className: 'right' },
    { titleKey: TITLE.totalBorrowed, className: 'right', width: '120px' },
    { titleKey: TITLE.cap, className: 'right', width: '120px' },
    { titleKey: TITLE.available, className: 'right', width: '120px' },
    { titleKey: TITLE.totalCollateral, className: 'right', width: '260px' },
  ]

  return (
    <>
      <colgroup>
        {contents.map(({ titleKey, width, show }, idx) => {
          if (typeof show !== 'undefined' && !show) return null

          return <col key={`col${idx}`} {...(width ? { width } : {})} />
        })}
      </colgroup>
      <thead>
        <tr>
          {contents.map(({ titleKey, className, width, show, ...props }, idx) => {
            if (typeof show !== 'undefined' && !show) return null

            const { title, tooltip, tooltipProps = {} } = titleMapper[titleKey]
            const key = `thead${idx}`

            if (titleKey === TITLE.isInMarket) {
              return (
                <th key={key} className="in-pool">
                  {' '}
                </th>
              )
            }

            return (
              <th key={key} className={className}>
                <StyledTheadSortButton sortIdKey={titleKey} {...theadBtnProps} {...props} loading={!isReadyDetail}>
                  {title}{' '}
                  {tooltip && (
                    <TooltipWrapper>
                      <TooltipIcon {...tooltipProps}>{tooltip}</TooltipIcon>
                    </TooltipWrapper>
                  )}
                </StyledTheadSortButton>
              </th>
            )
          })}
        </tr>
      </thead>
    </>
  )
}

const StyledTheadSortButton = styled(TheadSortButton)`
  white-space: nowrap;
`

const TooltipWrapper = styled.span`
  white-space: initial;
`

export default TableHead
