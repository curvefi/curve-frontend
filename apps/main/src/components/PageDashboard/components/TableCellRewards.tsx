import type { SortId } from '@main/components/PageDashboard/types'

import styled from 'styled-components'

import { SORT_ID } from '@main/components/PageDashboard/utils'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { haveRewardsApy } from '@main/utils/utilsCurvejs'

import { Chip } from '@ui/Typography'
import { DetailText } from '@main/components/PageDashboard/components/TableRow'
import PoolRewardsCrv from '@main/components/PoolRewardsCrv'
import TableCellRewardsTooltip from '@main/components/PageDashboard/components/TableCellRewardsTooltip'
import TableCellRewardsBase from '@main/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsOthers from '@main/components/PagePoolList/components/TableCellRewardsOthers'
import { RewardsApy, PoolData } from '@main/types/main.types'

const TableCellRewards = ({
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
  const haveUserCrvApy = userCrvApy && !isNaN(userCrvApy)
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status || {}
  const showUserCrvRewards = !!poolData && !rewardsNeedNudging && !areCrvRewardsStuckInBridge

  const Rewards = () => {
    const parsedUserCrvApy = `${formatNumber(userCrvApy, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })} CRV`
    return (
      <>
        {!showUserCrvRewards ? (
          <PoolRewardsCrv rewardsApy={rewardsApy} poolData={poolData} />
        ) : typeof userCrvApy !== 'undefined' && haveCrv ? (
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
            {sortBy === SORT_ID.userCrvApy ? <strong>{parsedUserCrvApy}</strong> : parsedUserCrvApy}{' '}
            {!!boostedCrvApy ? (
              <DetailText> of {formatNumber(boostedCrvApy, FORMAT_OPTIONS.PERCENT)}</DetailText>
            ) : null}
          </Chip>
        ) : null}
        <TableCellRewardsOthers isHighlight={sortBy === SORT_ID.rewardOthers} rewardsApy={rewardsApy} />
      </>
    )
  }

  if (rewardsApyKey === 'baseApy') {
    return (
      <RewardsWrapper>
        <TableCellRewardsBase base={rewardsApy?.base} isHighlight={sortBy === SORT_ID.rewardBase} poolData={poolData} />
      </RewardsWrapper>
    )
  } else if (rewardsApyKey === 'rewardsApy') {
    return <RewardsWrapper>{haveRewards ? <Rewards /> : null}</RewardsWrapper>
  } else if (rewardsApyKey === 'all') {
    return (
      <RewardsWrapper>
        {typeof base?.day !== 'undefined' ? (
          <div>
            <TableCellRewardsBase
              base={rewardsApy?.base}
              isHighlight={sortBy === SORT_ID.rewardBase}
              poolData={poolData}
            />
          </div>
        ) : (
          '-'
        )}
        {haveRewards ? <Rewards /> : null}
      </RewardsWrapper>
    )
  }

  return null
}

const RewardsWrapper = styled.div`
  line-height: 1.2;
`

export default TableCellRewards
