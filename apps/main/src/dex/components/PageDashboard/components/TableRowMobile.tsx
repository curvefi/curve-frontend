import { useRef, useState } from 'react'
import { styled } from 'styled-components'
import { TableCellBalances } from '@/dex/components/PageDashboard/components/TableCellBalances'
import { TableCellClaimables } from '@/dex/components/PageDashboard/components/TableCellClaimables'
import { TableCellProfit } from '@/dex/components/PageDashboard/components/TableCellProfit'
import { TableCellRewards } from '@/dex/components/PageDashboard/components/TableCellRewards'
import type { DashboardTableRowProps } from '@/dex/components/PageDashboard/types'
import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { PoolLabel } from '@/dex/components/PoolLabel'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { Td, Tr } from '@ui/Table'
import { useIntersectionObserver } from '@ui-kit/hooks/useIntersectionObserver'
import { TableCellRewardsOthers } from '../../TableCellRewardsOthers'

export const TableRowMobile = ({
  isLite,
  blockchainId,
  formValues,
  dashboardData,
  poolData,
  poolRewardsApy,
  tableLabel,
  fetchBoost,
  updatePath,
}: DashboardTableRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const { isIntersecting: isVisible } = useIntersectionObserver(rowRef, { freezeOnceVisible: true })

  const [showDetail, setShowDetail] = useState(false)

  const { poolId, userCrvApy } = dashboardData
  const { sortBy } = formValues

  return (
    <Tr ref={rowRef}>
      <Td>
        {poolId && (
          <Box flex flexJustifyContent="space-between">
            {blockchainId && (
              <PoolLabel
                isVisible={isVisible}
                blockchainId={blockchainId}
                poolData={poolData}
                onClick={() => updatePath(poolId)}
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
