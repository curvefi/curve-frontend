import type { ComponentPropsWithRef } from 'react'
import { useRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { TableCellBalances } from '@/dex/components/PageDashboard/components/TableCellBalances'
import { TableCellClaimables } from '@/dex/components/PageDashboard/components/TableCellClaimables'
import { TableCellProfit } from '@/dex/components/PageDashboard/components/TableCellProfit'
import { TableCellRewards } from '@/dex/components/PageDashboard/components/TableCellRewards'
import type { DashboardTableRowProps } from '@/dex/components/PageDashboard/types'
import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { TableCellRewardsOthers } from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'
import { PoolLabel } from '@/dex/components/PoolLabel'
import { Tr, Td } from '@ui/Table'
import { useIntersectionObserver } from '@ui-kit/hooks/useIntersectionObserver'

export const TableRow = ({
  isLite,
  blockchainId,
  formValues: { sortBy },
  fetchBoost,
  poolData,
  poolRewardsApy,
  dashboardData,
  updatePath,
}: DashboardTableRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const { isIntersecting: isVisible } = useIntersectionObserver(rowRef, { freezeOnceVisible: true })

  const { poolId, userCrvApy } = dashboardData

  return (
    <Tr ref={rowRef} onClick={() => updatePath(poolId)}>
      <Td>
        <PoolLabel blockchainId={blockchainId} isVisible={isVisible} poolData={poolData} />
      </Td>
      {isLite ? (
        <Td className="right">
          <TableCellRewardsOthers isHighlight={sortBy === SORT_ID.rewardOthers} rewardsApy={poolRewardsApy} />
        </Td>
      ) : (
        <Td className="right">
          <TableCellRewards
            poolData={poolData}
            rewardsApyKey="all"
            rewardsApy={poolRewardsApy}
            sortBy={sortBy}
            userCrvApy={userCrvApy}
            {...fetchBoost}
          />
        </Td>
      )}
      <Td className="right">
        <TableCellBalances isHighLight={sortBy === SORT_ID.liquidityUsd} {...dashboardData} />
      </Td>
      <Td className="right">
        <TableCellProfit sortBy={sortBy} {...dashboardData} />
      </Td>
      <Td className="right">
        <TableCellClaimables isHighLight={sortBy === SORT_ID.claimables} {...dashboardData} />
      </Td>
    </Tr>
  )
}

type SpanProps = ComponentPropsWithRef<'span'>

export const DetailText: IStyledComponent<'web', SpanProps> = styled.span`
  font-size: var(--font-size-1);
  opacity: 0.8;
`

type DivProps = ComponentPropsWithRef<'div'>

export const Info: IStyledComponent<'web', DivProps> = styled.div`
  white-space: nowrap;
`
