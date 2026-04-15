import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import type { PoolListItem } from '../types'
import { RewardsCrvCell } from './RewardsCrvCell'
import { RewardsIncentivesCell } from './RewardsIncentivesCell'

export const RewardsOtherCell = (props: CellContext<PoolListItem, RewardsApy | undefined>) => (
  <>
    <RewardsCrvCell {...props} />
    <RewardsIncentivesCell {...props} />
  </>
)
