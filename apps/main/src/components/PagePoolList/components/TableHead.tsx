import type { Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'
import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'

import { t } from '@lingui/macro'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'

import { Th, Thead, TheadSortButton } from '@/ui/Table'
import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TableHeadRewards from '@/components/PagePoolList/components/TableHeadRewards'

const TableHead = ({
  isReadyRewardsApy,
  isReadyTvl,
  isReadyVolume,
  isMdUp,
  searchParams,
  showInPoolColumn,
  tableLabels,
  updatePath,
}: {
  isReadyRewardsApy: boolean
  isReadyTvl: boolean
  isReadyVolume: boolean
  isMdUp: boolean
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
      <StyledThead>
        <tr>
          {showInPoolColumn && <th className="in-pool"> </th>}

          <Th $first={!showInPoolColumn}>
            <StyledTheadSortButton
              className="left"
              sortIdKey="name"
              {...props}
              loading={false}
              indicatorPlacement="right"
            >
              {tableLabels.name.name}
            </StyledTheadSortButton>
          </Th>
          {isMdUp ? (
            <>
              <Th>
                <StyledTheadSortButton
                  className="right"
                  sortIdKey="rewardsBase"
                  {...props}
                  loading={!isReadyRewardsApy}
                >
                  {tableLabels.rewardsBase.name}
                  <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
                </StyledTheadSortButton>
              </Th>
              <Th className="right">
                <Box grid gridRowGap={1}>
                  <TableHeadRewards isReadyRewardsApy={isReadyRewardsApy} tableLabels={tableLabels} {...props} />
                </Box>
              </Th>
            </>
          ) : (
            <Th className="right">
              <Box grid gridRowGap={2} flexJustifyContent="flex-end">
                <TheadSortButton sortIdKey="rewardsBase" {...props} loading={!isReadyRewardsApy}>
                  {tableLabels.rewardsBase.name}
                  <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
                </TheadSortButton>
                <Box flex flexJustifyContent="flex-end">
                  <TableHeadRewards isReadyRewardsApy={isReadyRewardsApy} tableLabels={tableLabels} {...props} />
                </Box>
              </Box>
            </Th>
          )}
          <Th>
            <StyledTheadSortButton className="right" sortIdKey="volume" {...props} loading={!isReadyVolume}>
              {tableLabels.volume.name}
            </StyledTheadSortButton>
          </Th>
          <Th $last>
            <StyledTheadSortButton
              className="right"
              sortIdKey="tvl"
              {...props}
              loading={!isReadyTvl}
              indicatorPlacement="left"
            >
              {tableLabels.tvl.name}
            </StyledTheadSortButton>
          </Th>
        </tr>
      </StyledThead>
    </>
  )
}

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
  width: 21px;
`

const StyledThead = styled(Thead)`
  font-size: var(--font-size-2);
`

const StyledTheadSortButton = styled(TheadSortButton)`
  width: 100%;
  height: 100%;
`

export default TableHead
