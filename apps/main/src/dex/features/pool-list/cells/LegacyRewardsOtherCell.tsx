import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { useHasPoolRewards } from '../hooks/useHasPoolRewards'
import type { LegacyPoolListItem } from '../legacyPoolList.types'
import { LegacyRewardsCrvCell } from './LegacyRewardsCrvCell'
import { LegacyRewardsIncentivesCell } from './LegacyRewardsIncentivesCell'
import { Placeholder } from './Placeholder'

type Prop = CellContext<LegacyPoolListItem, RewardsApy | undefined>

export const LegacyRewardsOtherCell = (props: Prop) => {
  const rewards = props.getValue()
  const { hasCrv, hasIncentives } = useHasPoolRewards(rewards, props.row.original)

  return hasCrv || hasIncentives ? (
    <>
      <LegacyRewardsCrvCell placeholder={false} {...props} />
      <LegacyRewardsIncentivesCell placeholder={false} {...props} />
    </>
  ) : (
    <Placeholder />
  )
}
