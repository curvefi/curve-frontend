import type { DashboardTableRowProps } from '@/dex/components/PageDashboard/types'

import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import useIntersectionObserver from '@ui/hooks/useIntersectionObserver'

import { Tr, Td } from '@ui/Table'
import PoolLabel from '@/dex/components/PoolLabel'
import TableCellBalances from '@/dex/components/PageDashboard/components/TableCellBalances'
import TableCellClaimables from '@/dex/components/PageDashboard/components/TableCellClaimables'
import TableCellProfit from '@/dex/components/PageDashboard/components/TableCellProfit'
import TableCellRewards from '@/dex/components/PageDashboard/components/TableCellRewards'
import TableCellRewardsOthers from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'

const TableRow = ({
  isLite,
  imageBaseUrl,
  formValues: { sortBy },
  fetchBoost,
  poolData,
  poolRewardsApy,
  dashboardData,
  updatePath,
}: DashboardTableRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(rowRef, { freezeOnceVisible: true })
  const isVisible = entry?.isIntersecting || false

  const { poolId, userCrvApy } = dashboardData

  return (
    <Tr ref={rowRef} onClick={() => updatePath(poolId)}>
      <Td>
        <PoolLabel imageBaseUrl={imageBaseUrl} isVisible={isVisible} poolData={poolData} />
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

export const DetailText = styled.span`
  font-size: var(--font-size-1);
  opacity: 0.8;
`

export const Info = styled.div`
  white-space: nowrap;
`

export default TableRow
