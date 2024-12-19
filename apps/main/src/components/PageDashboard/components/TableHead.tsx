import type { FormValues, Order, SortId, TableLabel } from '@/components/PageDashboard/types'
import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { SORT_ID } from '@/components/PageDashboard/utils'
import { useDashboardContext } from '@/components/PageDashboard/dashboardContext'

import { Th, Thead, TheadSortButton } from '@/ui/Table'
import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { breakpoints } from '@/ui/utils'
import styled from 'styled-components'

const TableHead = ({ tableLabel }: { tableLabel: TableLabel }) => {
  const { isLite, isLoading, formValues, updateFormValues } = useDashboardContext()

  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    updateFormValues({ sortBy: sortBy as SORT_ID, sortByOrder: sortByOrder as Order })
  }

  const props: Omit<TheadSortButtonProps<SortId>, 'sortIdKey'> = {
    loading: isLoading,
    sortBy: formValues.sortBy,
    sortByOrder: formValues.sortByOrder,
    handleBtnClickSort,
  }

  const BASE_TOOLTIP = t`Variable APY based on today's trading activity`
  const OTHERS_TOOLTIP = t`Token APR based on current prices of tokens and reward rates`

  return (
    <>
      <colgroup>
        <Col className="poolName left" />
        <col className="right" />
        <col className="right" />
        <col className="right" />
        <col className="right" />
      </colgroup>
      <Thead>
        <tr>
          <Th className="left">
            <TheadSortButton sortIdKey={SORT_ID.poolName} {...props} indicatorPlacement="right">
              {tableLabel.poolName.name}
            </TheadSortButton>
          </Th>

          <Th className="right">
            {isLite ? (
              <TheadSortButton sortIdKey={SORT_ID.rewardOthers} nowrap {...props}>
                {t`Rewards tAPR`} <IconTooltip placement="top">{OTHERS_TOOLTIP}</IconTooltip>
              </TheadSortButton>
            ) : (
              <Box grid gridRowGap={2}>
                <TheadSortButton sortIdKey={SORT_ID.rewardBase} {...props}>
                  {tableLabel.rewardBase.name} <IconTooltip placement="top">{BASE_TOOLTIP}</IconTooltip>
                </TheadSortButton>
                <Box grid gridRowGap={1}>
                  <div>
                    {t`Rewards tAPR`} <IconTooltip placement="top">{OTHERS_TOOLTIP}</IconTooltip>
                  </div>
                  <Box grid gridAutoFlow="column" flexAlignItems="center" gridColumnGap={2}>
                    <TheadSortButton sortIdKey={SORT_ID.userCrvApy} nowrap {...props}>
                      {tableLabel.userCrvApy.name}
                    </TheadSortButton>
                    +
                    <TheadSortButton sortIdKey={SORT_ID.rewardOthers} nowrap {...props}>
                      {tableLabel.rewardOthers.name}
                    </TheadSortButton>
                  </Box>
                </Box>
              </Box>
            )}
          </Th>

          <Th className="right">
            <TheadSortButton sortIdKey={SORT_ID.liquidityUsd} {...props} indicatorPlacement="left">
              {tableLabel.liquidityUsd.name}
            </TheadSortButton>
          </Th>

          <Th className="right">
            <TheadSortButton sortIdKey={SORT_ID.profits} {...props}>
              {tableLabel.profits.name}
            </TheadSortButton>
          </Th>

          <Th className="right">
            <TheadSortButton sortIdKey={SORT_ID.claimables} {...props}>
              {tableLabel.claimables.name}
            </TheadSortButton>
          </Th>
        </tr>
      </Thead>
    </>
  )
}

const Col = styled.col`
  @media (min-width: ${breakpoints.lg}rem) {
    min-width: 200px;

    &.poolName {
      min-width: 400px;
    }
  }
`

export default TableHead
