import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { RewardsApy } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@ui-kit/utils'
import { LegacyPoolColumnId } from '../columns'
import { useLegacyHasPoolRewards } from '../hooks/useLegacyHasPoolRewards'
import type { LegacyPoolListItem } from '../legacy-pools.types'
import { Placeholder } from './Placeholder'

type Prop = CellContext<LegacyPoolListItem, RewardsApy | undefined> & { placeholder?: boolean }

export const LegacyRewardsIncentivesCell = ({
  getValue,
  table,
  row: { original: poolData },
  placeholder = true,
}: Prop) => {
  const rewards = getValue()
  const { hasIncentives, campaigns } = useLegacyHasPoolRewards(rewards, poolData)
  const { other } = rewards ?? {}

  return hasIncentives ? (
    <Stack sx={{ alignItems: 'end' }}>
      {other?.map(o => (
        <Typography
          key={o.tokenAddress}
          sx={{ fontWeight: isSortedBy(table, LegacyPoolColumnId.RewardsIncentives) ? 'bold' : 'normal' }}
        >
          {formatNumber(o.apy, 'percent.value')} {o.symbol}
        </Typography>
      ))}
      {campaigns.length > 0 && <CampaignRewardsRow rewardItems={campaigns} />}
    </Stack>
  ) : placeholder ? (
    <Placeholder />
  ) : null
}
