import type { Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'
import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'

import { t } from '@lingui/macro'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { TheadSortButton } from '@/ui/Table'
import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TableHeadRewards from '@/components/PagePoolList/components/TableHeadRewards'

const TableHead = ({
  isReadyRewardsApy,
  isReadyTvl,
  isReadyVolume,
  isMdUp,
  resultRewardsCrvCount,
  resultRewardsOtherCount,
  searchParams,
  showInPoolColumn,
  tableLabels,
  updatePath,
}: {
  isReadyRewardsApy: boolean
  isReadyTvl: boolean
  isReadyVolume: boolean
  isMdUp: boolean
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  searchParams: SearchParams
  showInPoolColumn: boolean
  tableLabels: PoolListTableLabel
  updatePath(searchParams: Partial<SearchParams>): void
}) => {
  const handleBtnClickSort = useCallback(
    (sortBy: string, sortByOrder: Order) => {
      updatePath({ sortBy: sortBy as SortKey, sortByOrder })
    },
    [updatePath]
  )

  const props: Omit<TheadSortButtonProps<SortKey>, 'sortIdKey' | 'loading'> = {
    sortBy: searchParams.sortBy,
    sortByOrder: searchParams.sortByOrder,
    handleBtnClickSort,
  }

  return (
    <>
      <colgroup>
        {showInPoolColumn && <ColInPool className="row-in-pool" />}
        <Col className="left pool" />
        {isMdUp ? (
          <>
            <Col className="right base" />
            <Col className="right rewards" />
          </>
        ) : (
          <Col className="right rewards" />
        )}
        <col className="right" />
        <col className="right" />
      </colgroup>
      <thead>
        <tr>
          {showInPoolColumn && <th className="in-pool"> </th>}

          <th className="left">
            <TheadSortButton sortIdKey="name" {...props} loading={false} indicatorPlacement="right">
              {tableLabels.name.name}
            </TheadSortButton>
          </th>
          {isMdUp ? (
            <>
              <th className="right">
                <TheadSortButton sortIdKey="rewardsBase" {...props} loading={!isReadyRewardsApy}>
                  {tableLabels.rewardsBase.name}
                  <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
                </TheadSortButton>
              </th>
              <th className="right">
                <Box grid gridRowGap={1}>
                  <TableHeadRewards
                    isReadyRewardsApy={isReadyRewardsApy}
                    resultRewardsCrvCount={resultRewardsCrvCount}
                    resultRewardsOtherCount={resultRewardsOtherCount}
                    tableLabels={tableLabels}
                    {...props}
                  />
                </Box>
              </th>
            </>
          ) : (
            <th className="right">
              <Box grid gridRowGap={2}>
                <TheadSortButton sortIdKey="rewardsBase" {...props} loading={!isReadyRewardsApy}>
                  {tableLabels.rewardsBase.name}
                  <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
                </TheadSortButton>
                <div>
                  <TableHeadRewards
                    isReadyRewardsApy={isReadyRewardsApy}
                    resultRewardsCrvCount={resultRewardsCrvCount}
                    resultRewardsOtherCount={resultRewardsOtherCount}
                    tableLabels={tableLabels}
                    {...props}
                  />
                </div>
              </Box>
            </th>
          )}
          <th className="right">
            <TheadSortButton sortIdKey="volume" {...props} loading={!isReadyVolume}>
              {tableLabels.volume.name}
            </TheadSortButton>
          </th>
          <th className="right">
            <TheadSortButton sortIdKey="tvl" {...props} loading={!isReadyTvl} indicatorPlacement="left">
              {tableLabels.tvl.name}
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

    &.pool {
      min-width: 400px;
    }
    &.base {
      min-width: 100px;
    }
    &.rewards {
      min-width: 300px;
    }
  }
`

const ColInPool = styled.col`
  width: 25px;
`

export default TableHead
