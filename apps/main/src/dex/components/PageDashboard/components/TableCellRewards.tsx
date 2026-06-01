import type { ReactNode } from 'react'
import { styled } from 'styled-components'
import { TableCellRewardsTooltip } from '@/dex/components/PageDashboard/components/TableCellRewardsTooltip'
import { DetailText } from '@/dex/components/PageDashboard/components/TableRow'
import type { SortId } from '@/dex/components/PageDashboard/types'
import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { PoolData, RewardsApy } from '@/dex/types/main.types'
import { haveRewardsApy } from '@/dex/utils/utilsCurvejs'
import { Chip } from '@ui/Typography'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { formatNumber } from '@ui-kit/utils'
import { TableCellRewardsBase } from '../../TableCellRewardsBase'
import { TableCellRewardsOthers } from '../../TableCellRewardsOthers'

const Bold = ({ children }: { children: ReactNode }) => <strong>{children}</strong>

export const TableCellRewards = ({
  poolData,
  rewardsApy,
  rewardsApyKey,
  userCrvApy,
  sortBy,
  fetchUserPoolBoost,
}: {
  poolData: PoolData
  rewardsApy: RewardsApy | undefined
  rewardsApyKey: 'all' | 'baseApy' | 'rewardsApy'
  sortBy: SortId
  userCrvApy?: number
  fetchUserPoolBoost: (() => Promise<string>) | null
}) => {
  const { base, crv } = rewardsApy ?? {}
  const { haveCrv, haveOther } = haveRewardsApy(rewardsApy ?? {})
  const haveRewards = haveCrv || haveOther
  const boostedCrvApy = haveCrv && crv?.[1]
  const haveUserCrvApy = userCrvApy && !Number.isNaN(userCrvApy)
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status ?? {}
  const showUserCrvRewards = !!poolData && !rewardsNeedNudging && !areCrvRewardsStuckInBridge

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
                  tooltipProps: {
                    textAlign: 'left',
                    minWidth: '300px',
                  },
                }
              : {})}
            size="md"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
            <WithWrapper shouldWrap={sortBy === SORT_ID.userCrvApy} Wrapper={Bold}>
              {`${formatNumber(userCrvApy, { unit: 'percentage', abbreviate: false })} CRV`}
            </WithWrapper>{' '}
            {boostedCrvApy ? (
              <DetailText> of {formatNumber(boostedCrvApy, { unit: 'percentage', abbreviate: false })}</DetailText>
            ) : null}
          </Chip>
        ) : null
      ) : (
        <PoolRewardsCrv rewardsApy={rewardsApy} poolData={poolData} />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
      <TableCellRewardsOthers isHighlight={sortBy === SORT_ID.rewardOthers} rewardsApy={rewardsApy} />
    </>
  )

  if (rewardsApyKey === 'baseApy') {
    return (
      <RewardsWrapper>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule. */}
        <TableCellRewardsBase base={rewardsApy?.base} isHighlight={sortBy === SORT_ID.rewardBase} poolData={poolData} />
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
              poolData={poolData}
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
