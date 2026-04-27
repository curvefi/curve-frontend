import { RewardsApy } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { useHasPoolRewards } from '../hooks/useHasPoolRewards'
import type { PoolListItem } from '../types'
import { Placeholder } from './Placeholder'
import { RewardsCrvCell } from './RewardsCrvCell'
import { RewardsIncentivesCell } from './RewardsIncentivesCell'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsOtherCell = (props: Prop) => {
  const rewards = props.getValue()
  const { hasCrv, hasIncentives } = useHasPoolRewards(rewards, props.row.original)

  return hasCrv || hasIncentives ? (
    <Stack>
      <RewardsCrvCell placeholder={false} {...props} />
      <RewardsIncentivesCell placeholder={false} {...props} />
    </Stack>
  ) : (
    <Placeholder />
  )
}
