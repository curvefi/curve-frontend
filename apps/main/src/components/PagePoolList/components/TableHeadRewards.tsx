import Box from '@/ui/Box'
import TheadSortButton, { type TheadSortButtonProps } from '@/ui/Table/TheadSortButton'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { t } from '@lingui/macro'
import React from 'react'
import type { PoolListTableLabel } from '@/components/PagePoolList/types'
import type { SortKey } from '@/components/PagePoolList/types'



const TableHeadRewards = ({
  isReadyRewardsApy,
  resultRewardsCrvCount,
  resultRewardsOtherCount,
  tableLabels,
  ...props
}: Omit<TheadSortButtonProps<SortKey>, 'sortIdKey' | 'loading'> & {
  isReadyRewardsApy: boolean
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  tableLabels: PoolListTableLabel
}) => {
  return (
    <>
      <div>
        {t`Rewards tAPR`}{' '}
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
