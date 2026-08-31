import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { RewardsApy } from '@/dex/types/main.types'
import { isSortedBy, type CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { LegacyPoolColumnId } from '../columns'
import { useLegacyHasPoolRewards } from '../hooks/useLegacyHasPoolRewards'
import type { LegacyPoolRow } from '../types'
import { Placeholder } from './Placeholder'

type Prop = CellContext<CurveTableFeatures, LegacyPoolRow, RewardsApy | undefined> & { placeholder?: boolean }

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
