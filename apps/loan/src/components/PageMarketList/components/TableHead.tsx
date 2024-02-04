import type { IndicatorPlacement } from '@/ui/Table/types'
import type { FormValues, Order, TableLabel, SortKey } from '@/components/PageMarketList/types'

import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { TheadSortButton } from '@/ui/Table'

interface TheadBtnProps {
  align: string[]
  indicatorPlacement: IndicatorPlacement
  sortBy: string
  sortByOrder: Order
  handleBtnClickSort: (sortBy: string, sortOrder: Order) => void
}

const TableHead = ({
  formValues,
  isReadyDetail,
  someLoanExists,
  tableLabels,
  updateFormValues,
}: {
  formValues: FormValues
  isReadyDetail: boolean
  someLoanExists: boolean
  tableLabels: TableLabel
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

  return (
    <>
      <colgroup>
        <ColInPool className="row-in-pool" />
        <Col className="left collateral" />
        <col className="right rate" />
        <col className="right total-borrowed" />
        <col className="right cap" />
        <col className="right available" />
        <col className="right total-collateral" />
      </colgroup>
      <thead>
        <tr>
          <th className="in-pool"> </th>
          <th className="left">
            <TheadSortButton sortIdKey="name" {...props} loading={false}>
              {tableLabels.name.name}
            </TheadSortButton>
          </th>

          {someLoanExists && (
            <>
              <th className="right">
                <TheadSortButton sortIdKey="myHealth" {...props} loading={!isReadyDetail}>
                  {tableLabels.myHealth.name}
                </TheadSortButton>
              </th>
              <th className="right">
                <TheadSortButton sortIdKey="myDebt" {...props} loading={!isReadyDetail}>
                  {tableLabels.myDebt.name}
                </TheadSortButton>
              </th>
            </>
          )}
          <th className="right">
            <TheadSortButton sortIdKey="rate" {...props} loading={!isReadyDetail}>
              {tableLabels.rate.name}
            </TheadSortButton>
          </th>
          <th className="right">
            <TheadSortButton sortIdKey="totalBorrowed" {...props} loading={!isReadyDetail}>
              {tableLabels.totalBorrowed.name}{' '}
            </TheadSortButton>
          </th>
          <th className="right">
            <TheadSortButton sortIdKey="cap" {...props} loading={!isReadyDetail}>
              {tableLabels.cap.name}
            </TheadSortButton>
          </th>
          <th className="right">
            <TheadSortButton sortIdKey="available" {...props} loading={!isReadyDetail}>
              {tableLabels.available.name}
            </TheadSortButton>
          </th>
          <th className="right">
            <TheadSortButton sortIdKey="totalCollateral" {...props} loading={!isReadyDetail}>
              {tableLabels.totalCollateral.name}
            </TheadSortButton>
          </th>
        </tr>
      </thead>
    </>
  )
}

TableHead.displayName = 'TableHead'

const Col = styled.col`
  @media (min-width: ${breakpoints.lg}rem) {
    min-width: 200px;

    &.collateral {
      min-width: 350px;
    }
  }
`

const ColInPool = styled.col`
  width: 25px;
`

export default TableHead
