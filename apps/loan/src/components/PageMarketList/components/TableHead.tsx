import type { IndicatorPlacement } from '@/ui/Table/types'
import type { FormValues, Order, SortKey } from '@/components/PageMarketList/types'

import { TheadSortButton, Th, Tr } from '@/ui/Table'
import { TITLE_MAPPER, TITLE } from '@/constants'
import TooltipIcon from 'ui/src/Tooltip/TooltipIcon'

interface TheadBtnProps {
  align: string[]
  indicatorPlacement: IndicatorPlacement
  sortBy: string
  sortByOrder: Order
  handleBtnClickSort: (sortBy: string, sortOrder: Order) => void
}

type Content = {
  titleKey: TitleKey
  className: string
  show?: boolean
  width?: string
  indicatorPlacement?: IndicatorPlacement
}

const TableHead = ({
  formValues,
  isReadyDetail,
  someLoanExists,
  updateFormValues,
}: {
  formValues: FormValues
  isReadyDetail: boolean
  someLoanExists: boolean
  updateFormValues: (formValues: Partial<FormValues>) => void
}) => {
  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    const updatedFormValues = { sortBy: sortBy as SortKey, sortByOrder }
    updateFormValues(updatedFormValues)
  }

  const props: TheadBtnProps = {
    align: ['left', 'end'],
    indicatorPlacement: 'left',
    sortBy: formValues.sortBy,
    sortByOrder: formValues.sortByOrder,
    handleBtnClickSort,
  }

  // prettier-ignore
  const contents: Content[] = [
    { titleKey: TITLE.isInMarket, show: someLoanExists, className: 'left', width: '20px', indicatorPlacement: 'right' },
    { titleKey: TITLE.name, className: 'left', width: '150px' },
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
        <Tr>
          {contents.map(({ titleKey, className, width, show }, idx) => {
            if (typeof show !== 'undefined' && !show) return null

            const { name, tooltip, tooltipProps = {} } = TITLE_MAPPER[titleKey]
            const key = `thead${idx}`

            if (titleKey === TITLE.isInMarket) {
              return (
                <Th key={key} className="in-pool">
                  {' '}
                </Th>
              )
            }

            return (
              <Th key={key} className={className}>
                <TheadSortButton sortIdKey={titleKey} {...props} loading={!isReadyDetail}>
                  {name} {tooltip && <TooltipIcon {...tooltipProps}>{tooltip}</TooltipIcon>}
                </TheadSortButton>
              </Th>
            )
          })}
        </Tr>
      </thead>
    </>
  )
}

export default TableHead
