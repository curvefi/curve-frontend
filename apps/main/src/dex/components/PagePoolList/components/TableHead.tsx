import type { ColumnKeys, Order, PoolListTableLabel, SearchParams, SortKey } from '@/dex/components/PagePoolList/types'
import type { TheadSortButtonProps } from '@ui/Table/TheadSortButton'

import { t } from '@lingui/macro'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'

import { Th, Thead, TheadSortButton } from '@ui/Table'
import Box from '@ui/Box'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import TableHeadRewards from '@/dex/components/PagePoolList/components/TableHeadRewards'
import { COLUMN_KEYS } from '@/dex/components/PagePoolList/utils'

type Props = {
  isLite: boolean
  isReadyRewardsApy: boolean
  isReadyTvl: boolean
  isReadyVolume: boolean
  columnKeys: ColumnKeys[]
  searchParams: SearchParams
  tableLabels: PoolListTableLabel
  updatePath(searchParams: Partial<SearchParams>): void
}

const TableHead: React.FC<Props> = ({
  isLite,
  isReadyRewardsApy,
  isReadyTvl,
  isReadyVolume,
  columnKeys,
  searchParams,
  tableLabels,
  updatePath,
}) => {
  const handleBtnClickSort = useCallback(
    (sortBy: string, sortByOrder: Order) => {
      updatePath({ sortBy: sortBy as SortKey, sortByOrder })
    },
    [updatePath],
  )

  const props: Omit<TheadSortButtonProps<SortKey>, 'sortIdKey' | 'loading'> = {
    sortBy: searchParams.sortBy,
    sortByOrder: searchParams.sortByOrder,
    handleBtnClickSort,
  }

  const REWARDS_OTHER_TOOLTIP = t`Token APR based on current prices of tokens and reward rates`
  const REWARDS_BASE_TOOLTIP = t`Variable APY based on today's trading activity`

  return (
    <>
      <colgroup>
        {columnKeys.map((columnKey, idx) => (
          <React.Fragment key={`col${columnKey}${idx}`}>
            {columnKey === COLUMN_KEYS.inPool && <ColInPool className="row-in-pool" />}
            {columnKey === COLUMN_KEYS.poolName && <Col className="left pool" />}
            {columnKey === COLUMN_KEYS.rewardsLite && <Col className="right" />}
            {columnKey === COLUMN_KEYS.rewardsDesktop && (
              <>
                <Col className="right base" />
                <Col className="right rewards" />
              </>
            )}
            {columnKey === COLUMN_KEYS.rewardsMobile && <Col className="right rewards" />}
            {columnKey === COLUMN_KEYS.volume && <col className="right" />}
            {columnKey === COLUMN_KEYS.tvl && isLite && <Col className="right tvl" />}
            {columnKey === COLUMN_KEYS.tvl && !isLite && <col className="right" />}
          </React.Fragment>
        ))}
      </colgroup>
      <StyledThead>
        <tr>
          {columnKeys.map((columnKey, idx) => (
            <React.Fragment key={`thead${columnKey}${idx}`}>
              {columnKey === COLUMN_KEYS.inPool && (
                <th key={columnKey} className="in-pool">
                  {' '}
                </th>
              )}
              {columnKey === COLUMN_KEYS.poolName && (
                <Th key={columnKey} $first={idx === 0}>
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
              )}
              {columnKey === COLUMN_KEYS.rewardsLite && (
                <Th className="right">
                  <TheadSortButton
                    className="right"
                    sortIdKey="rewardsOther"
                    nowrap
                    {...props}
                    loading={!isReadyRewardsApy}
                  >
                    {tableLabels.rewardsOtherLite.name} tAPR
                    <IconTooltip placement="top">{REWARDS_OTHER_TOOLTIP}</IconTooltip>
                  </TheadSortButton>
                </Th>
              )}
              {columnKey === COLUMN_KEYS.rewardsDesktop && (
                <>
                  <Th>
                    <StyledTheadSortButton
                      className="right"
                      sortIdKey="rewardsBase"
                      {...props}
                      loading={!isReadyRewardsApy}
                    >
                      {tableLabels.rewardsBase.name}
                      <IconTooltip placement="top">{REWARDS_BASE_TOOLTIP}</IconTooltip>
                    </StyledTheadSortButton>
                  </Th>
                  <Th className="right">
                    <Box grid gridRowGap={1}>
                      <TableHeadRewards isReadyRewardsApy={isReadyRewardsApy} tableLabels={tableLabels} {...props} />
                    </Box>
                  </Th>
                </>
              )}
              {columnKey === COLUMN_KEYS.rewardsMobile && (
                <Th className="right">
                  <Box grid gridRowGap={2} flexJustifyContent="flex-end">
                    <TheadSortButton sortIdKey="rewardsBase" {...props} loading={!isReadyRewardsApy}>
                      {tableLabels.rewardsBase.name}
                      <IconTooltip placement="top">{REWARDS_BASE_TOOLTIP}</IconTooltip>
                    </TheadSortButton>
                    <Box flex flexJustifyContent="flex-end">
                      <TableHeadRewards isReadyRewardsApy={isReadyRewardsApy} tableLabels={tableLabels} {...props} />
                    </Box>
                  </Box>
                </Th>
              )}
              {columnKey === COLUMN_KEYS.volume && (
                <Th>
                  <StyledTheadSortButton className="right" sortIdKey="volume" {...props} loading={!isReadyVolume}>
                    {tableLabels.volume.name}
                  </StyledTheadSortButton>
                </Th>
              )}
              {columnKey === COLUMN_KEYS.tvl && (
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
              )}
            </React.Fragment>
          ))}
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
    &.tvl {
      min-width: 150px;
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
