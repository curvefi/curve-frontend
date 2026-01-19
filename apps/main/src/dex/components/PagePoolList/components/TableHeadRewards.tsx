import type { PoolListTableLabel } from '@/dex/components/PagePoolList/types'
import type { SortKey } from '@/dex/components/PagePoolList/types'
import { Box } from '@ui/Box'
import { type TheadSortButtonProps, TheadSortButton } from '@ui/Table/TheadSortButton'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { t } from '@ui-kit/lib/i18n'

export const TableHeadRewards = ({
  isReadyRewardsApy,
  tableLabels,
  ...props
}: Omit<TheadSortButtonProps<SortKey>, 'sortIdKey' | 'loading'> & {
  isReadyRewardsApy: boolean
  tableLabels: PoolListTableLabel
}) => (
  <>
    <div>
      {t`Rewards tAPR`}{' '}
      <IconTooltip placement="top">{t`Token APR based on current prices of tokens and reward rates`}</IconTooltip>
    </div>
    <Box grid gridAutoFlow="column" flexAlignItems="center" gridColumnGap={1} flexJustifyContent="flex-end">
      <TheadSortButton sortIdKey="rewardsCrv" nowrap {...props} loading={!isReadyRewardsApy}>
        {tableLabels.rewardsCrv.name}
      </TheadSortButton>
      +
      <TheadSortButton sortIdKey="rewardsOther" nowrap {...props} loading={!isReadyRewardsApy}>
        {tableLabels.rewardsOther.name}
      </TheadSortButton>
    </Box>
  </>
)
