import type { DashboardTableRowProps } from '@main/components/PageDashboard/types'

import React, { useRef, useState } from 'react'
import styled from 'styled-components'

import { SORT_ID } from '@main/components/PageDashboard/utils'
import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

import { Td, Tr } from '@ui/Table'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import PoolLabel from '@main/components/PoolLabel'
import TableCellClaimables from '@main/components/PageDashboard/components/TableCellClaimables'
import TableCellProfit from '@main/components/PageDashboard/components/TableCellProfit'
import TableCellRewards from '@main/components/PageDashboard/components/TableCellRewards'
import TableCellBalances from '@main/components/PageDashboard/components/TableCellBalances'
import TableCellRewardsOthers from '@main/components/PagePoolList/components/TableCellRewardsOthers'

const TableRowMobile: React.FC<DashboardTableRowProps> = ({
  isLite,
  imageBaseUrl,
  formValues,
  dashboardData,
  poolData,
  poolRewardsApy,
  tableLabel,
  fetchBoost,
  updatePath,
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(rowRef, { freezeOnceVisible: true })

  const [showDetail, setShowDetail] = useState(false)

  const { poolId, userCrvApy } = dashboardData
  const { sortBy } = formValues
  const isVisible = entry?.isIntersecting || false

  return (
    <Tr ref={rowRef}>
      <Td>
        {poolId && (
          <Box flex flexJustifyContent="space-between">
            {imageBaseUrl && (
              <PoolLabel
                isVisible={isVisible}
                imageBaseUrl={imageBaseUrl}
                poolData={poolData}
                poolListProps={{ onClick: () => updatePath(poolId) }}
              />
            )}
            <IconButton onClick={() => setShowDetail((prev) => !prev)}>
              {showDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </Box>
        )}

        <TableContentWrapper className={showDetail ? 'show' : ''}>
          <TableContent>
            <Box grid gridRowGap={2}>
              {isLite ? (
                <div>
                  <TableTitle>{tableLabel.rewardBase.name}</TableTitle>
                  <Td className="right">
                    <TableCellRewardsOthers isHighlight={sortBy === SORT_ID.rewardOthers} rewardsApy={poolRewardsApy} />
                  </Td>
                </div>
              ) : (
                <>
                  <div>
                    <TableTitle>{tableLabel.rewardBase.name}</TableTitle>
                    <TableCellRewards
                      poolData={poolData}
                      rewardsApyKey="baseApy"
                      rewardsApy={poolRewardsApy}
                      sortBy={sortBy}
                      {...fetchBoost}
                    />
                  </div>
                  <div>
                    <TableTitle>{tableLabel.userCrvApy.name}</TableTitle>
                    <TableCellRewards
                      poolData={poolData}
                      rewardsApyKey="rewardsApy"
                      rewardsApy={poolRewardsApy}
                      sortBy={sortBy}
                      userCrvApy={userCrvApy}
                      {...fetchBoost}
                    />
                  </div>
                </>
              )}
            </Box>

            <Box grid gridRowGap={2}>
              <TableTitle>{tableLabel.profits.name}</TableTitle>
              <TableCellProfit sortBy={sortBy} {...dashboardData} />
            </Box>

            <div className="grid-claimable">
              <TableTitle>{tableLabel.claimables.name}</TableTitle>
              <TableCellClaimables isMobile isHighLight={sortBy === SORT_ID.claimables} {...dashboardData} />
            </div>

            <div className="grid-balance">
              <TableTitle>{tableLabel.liquidityUsd.name}</TableTitle>
              <TableCellBalances isHighLight={sortBy === SORT_ID.liquidityUsd} {...dashboardData} />
            </div>
          </TableContent>
        </TableContentWrapper>
      </Td>
    </Tr>
  )
}

const TableTitle = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--table_head--font-weight);
`

const TableContentWrapper = styled.div`
  max-height: 0;
  overflow: hidden;

  &.show {
    max-height: 100rem;
    transition: max-height 0.5s ease-in;
  }
`

const TableContent = styled.div`
  display: grid;
  padding: 1rem 0.5rem;

  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2rem;
  grid-row-gap: 1rem;

  .grid-claimable {
    grid-column-start: 1;
    grid-column-end: 3;
  }
`

export default TableRowMobile
