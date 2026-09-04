import type { ComponentPropsWithRef } from 'react'
import { useRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { TableCellBalances } from '@/dex/components/PageDashboard/components/TableCellBalances'
import { TableCellClaimables } from '@/dex/components/PageDashboard/components/TableCellClaimables'
import { TableCellProfit } from '@/dex/components/PageDashboard/components/TableCellProfit'
import { TableCellRewards } from '@/dex/components/PageDashboard/components/TableCellRewards'
import type { DashboardTableRowProps } from '@/dex/components/PageDashboard/types'
import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { PoolLabel } from '@/dex/components/PoolLabel'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useIntersectionObserver } from '@evm-ui/hooks/useIntersectionObserver'
import { Tr, Td } from '@legacy-ui/Table'
import { TableCellRewardsOthers } from '../../TableCellRewardsOthers'

export const TableRow = ({
  rChainId: chainId,
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
      {isLiteChain(chainId) ? (
        <Td className="right">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
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
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
        <TableCellBalances isHighLight={sortBy === SORT_ID.liquidityUsd} {...dashboardData} />
      </Td>
      <Td className="right">
        <TableCellProfit sortBy={sortBy} {...dashboardData} />
      </Td>
      <Td className="right">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
        <TableCellClaimables isHighLight={sortBy === SORT_ID.claimables} {...dashboardData} />
      </Td>
    </Tr>
  )
}

type SpanProps = ComponentPropsWithRef<'span'>

// eslint-disable-next-line react-refresh/only-export-components
export const DetailText: IStyledComponent<'web', SpanProps> = styled.span`
  font-size: var(--font-size-1);
  opacity: 0.8;
`

type DivProps = ComponentPropsWithRef<'div'>

// eslint-disable-next-line react-refresh/only-export-components
export const Info: IStyledComponent<'web', DivProps> = styled.div`
  white-space: nowrap;
`
