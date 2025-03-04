import type { PoolListTableLabel } from '@/dex/components/PagePoolList/types'
import type { SortKey } from '@/dex/components/PagePoolList/types'
import { t } from '@ui-kit/lib/i18n'
import Box from '@ui/Box'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import TheadSortButton, { type TheadSortButtonProps } from '@ui/Table/TheadSortButton'

const TableHeadRewards = ({
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

export default TableHeadRewards
