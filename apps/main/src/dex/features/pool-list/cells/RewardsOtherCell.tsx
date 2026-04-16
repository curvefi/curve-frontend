import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { useHasPoolRewards } from '../hooks/useHasPoolRewards'
import type { PoolListItem } from '../types'
import { RewardsCrvCell } from './RewardsCrvCell'
import { RewardsIncentivesCell } from './RewardsIncentivesCell'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsOtherCell = (props: Prop) => {
  const rewards = props.getValue()
  const { hasCrv, hasIncentives } = useHasPoolRewards(rewards, props.row.original)

  if (!hasCrv && !hasIncentives) return <>-</>

  return (
    <>
      <RewardsCrvCell placeholder={null} {...props} />
      <RewardsIncentivesCell placeholder={null} {...props} />
    </>
  )
}
