import type { PoolListTableLabel, TheadBtnProps } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React from 'react'

import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TheadSortButton from '@/ui/Table/TheadSortButton'

const TableHeadRewards = ({
  isReadyRewardsApy,
  resultRewardsCrvCount,
  resultRewardsOtherCount,
  tableLabels,
  ...props
}: TheadBtnProps & {
  isReadyRewardsApy: boolean
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  tableLabels: PoolListTableLabel
}) => {
  return (
    <>
      <div>
        {t`Rewards tAPY`}{' '}
        <IconTooltip placement="top">{t`Token APR based on current prices of tokens and reward rates`}</IconTooltip>
      </div>
      <Box grid gridAutoFlow="column" flexAlignItems="center" gridColumnGap={1}>
        <TheadSortButton
          disabled={resultRewardsCrvCount === 0}
          sortIdKey="rewardsCrv"
          nowrap
          {...props}
          loading={!isReadyRewardsApy}
        >
          {tableLabels.rewardsCrv.name}
        </TheadSortButton>
        +
        <TheadSortButton
          disabled={resultRewardsOtherCount === 0}
          sortIdKey="rewardsOther"
          nowrap
          {...props}
          loading={!isReadyRewardsApy}
        >
          {tableLabels.rewardsOther.name}
        </TheadSortButton>
      </Box>
    </>
  )
}

export default TableHeadRewards
