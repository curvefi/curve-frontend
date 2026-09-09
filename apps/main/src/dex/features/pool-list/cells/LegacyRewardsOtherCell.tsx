import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useLegacyHasPoolRewards } from '../hooks/useLegacyHasPoolRewards'
import type { LegacyPoolRow } from '../types'
import { LegacyRewardsCrvCell } from './LegacyRewardsCrvCell'
import { LegacyRewardsIncentivesCell } from './LegacyRewardsIncentivesCell'
import { Placeholder } from './Placeholder'

type Prop = CellContext<CurveTableFeatures, LegacyPoolRow, RewardsApy | undefined>

export const LegacyRewardsOtherCell = (props: Prop) => {
  const rewards = props.getValue()
  const { hasCrv, hasIncentives } = useLegacyHasPoolRewards(rewards, props.row.original)

  return hasCrv || hasIncentives ? (
    <>
      <LegacyRewardsCrvCell placeholder={false} {...props} />
      <LegacyRewardsIncentivesCell placeholder={false} {...props} />
    </>
  ) : (
    <Placeholder />
  )
}
