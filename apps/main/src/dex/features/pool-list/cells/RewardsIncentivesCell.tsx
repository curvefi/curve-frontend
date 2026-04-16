import type { ReactNode } from 'react'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { RewardsApy } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolColumnId } from '../columns'
import { useHasPoolRewards } from '../hooks/useHasPoolRewards'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined> & { placeholder?: ReactNode }

export const RewardsIncentivesCell = ({ getValue, table, row: { original: poolData }, placeholder = '-' }: Prop) => {
  const rewards = getValue()
  const { hasIncentives, campaigns } = useHasPoolRewards(rewards, poolData)
  const { other } = rewards ?? {}

  if (!hasIncentives) return placeholder

  return (
    <Stack alignItems="end">
      {other?.map((o) => (
        <Typography
          fontWeight={isSortedBy(table, PoolColumnId.RewardsIncentives) ? 'bold' : 'normal'}
          key={o.tokenAddress}
        >
          {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
        </Typography>
      ))}
      {campaigns.length > 0 && <CampaignRewardsRow rewardItems={campaigns} />}
    </Stack>
  )
}
