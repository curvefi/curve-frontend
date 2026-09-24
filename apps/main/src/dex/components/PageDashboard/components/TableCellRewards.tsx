import type { ReactNode } from 'react'
import { styled } from 'styled-components'
import { TableCellRewardsTooltip } from '@/dex/components/PageDashboard/components/TableCellRewardsTooltip'
import { DetailText } from '@/dex/components/PageDashboard/components/TableRow'
import type { SortId } from '@/dex/components/PageDashboard/types'
import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { usePoolGaugeStatus } from '@/dex/queries/pool-gauge-status.query'
import type { RewardsApy } from '@/dex/queries/pool-rewards-apy.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { Chip } from '@legacy-ui/Typography'
import { formatNumber } from '@primitives/number.utils'
import { WithWrapper } from '@ui/components/WithWrapper'
import { TableCellRewardsBase } from '../../TableCellRewardsBase'
import { TableCellRewardsOthers } from '../../TableCellRewardsOthers'

const Bold = ({ children }: { children: ReactNode }) => <strong>{children}</strong>

function haveRewardsApy({ base, other, crv }: Partial<RewardsApy>) {
  const haveBase = base !== undefined
  const [crvMin, crvMax] = crv ?? ['', '']
  const haveCrv = Number(crvMin) > 0 || Number(crvMax) > 0
  const haveOther = Array.isArray(other) && other.length > 0

  return { haveBase, haveCrv, haveOther }
}

export const TableCellRewards = ({
  pool,
  rewardsApy,
  rewardsApyKey,
  userCrvApy,
  sortBy,
  fetchUserPoolBoost,
}: {
  pool: PoolTemplate
  rewardsApy: RewardsApy | undefined
  rewardsApyKey: 'all' | 'baseApy' | 'rewardsApy'
  sortBy: SortId
  userCrvApy?: number
  fetchUserPoolBoost: (() => Promise<string>) | null
}) => {
  const { data: gauge } = usePoolGaugeStatus({ chainId: pool.curve.chainId, poolId: pool.id })
  const { base, crv } = rewardsApy ?? {}
  const { haveCrv, haveOther } = haveRewardsApy(rewardsApy ?? {})
  const haveRewards = haveCrv || haveOther
  const boostedCrvApy = haveCrv && crv?.[1]
  const haveUserCrvApy = userCrvApy && !Number.isNaN(userCrvApy)
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = gauge?.status ?? {}
  const showUserCrvRewards = !!pool && !rewardsNeedNudging && !areCrvRewardsStuckInBridge

  const rewards = haveRewards && (
    <>
      {showUserCrvRewards ? (
        typeof userCrvApy !== 'undefined' && haveCrv ? (
          <Chip
            isBlock
            {...(haveUserCrvApy && boostedCrvApy && fetchUserPoolBoost
              ? {
                  tooltip: (
                    <TableCellRewardsTooltip
                      crv={crv}
                      userCrvApy={userCrvApy}
                      fetchUserPoolBoost={fetchUserPoolBoost}
                    />
                  ),
                  tooltipProps: { textAlign: 'left', minWidth: '300px' },
                }
              : {})}
            size="md"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
            <WithWrapper shouldWrap={sortBy === SORT_ID.userCrvApy} Wrapper={Bold}>
              {`${formatNumber(userCrvApy, 'percent.value')} CRV`}
            </WithWrapper>{' '}
            {boostedCrvApy ? <DetailText> of {formatNumber(boostedCrvApy, 'percent.value')}</DetailText> : null}
          </Chip>
        ) : null
      ) : (
        <PoolRewardsCrv rewardsApy={rewardsApy} pool={pool} />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
      <TableCellRewardsOthers isHighlight={sortBy === SORT_ID.rewardOthers} rewardsApy={rewardsApy} />
    </>
  )

  if (rewardsApyKey === 'baseApy') {
    return (
      <RewardsWrapper>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
        <TableCellRewardsBase base={rewardsApy?.base} isHighlight={sortBy === SORT_ID.rewardBase} pool={pool} />
      </RewardsWrapper>
    )
  } else if (rewardsApyKey === 'rewardsApy') {
    return <RewardsWrapper>{rewards}</RewardsWrapper>
  } else if (rewardsApyKey === 'all') {
    return (
      <RewardsWrapper>
        {typeof base?.day !== 'undefined' ? (
          <div>
            <TableCellRewardsBase
              base={rewardsApy?.base}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule.
              isHighlight={sortBy === SORT_ID.rewardBase}
              pool={pool}
            />
          </div>
        ) : (
          '-'
        )}
        {rewards}
      </RewardsWrapper>
    )
  }

  return null
}

const RewardsWrapper = styled.div`
  line-height: 1.2;
`
