import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { CellContext } from '@tanstack/react-table'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsIncentivesCell = ({ getValue, table, row: { original: poolData } }: Prop) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })
  const { other } = getValue() ?? {}

  return other?.length || campaigns.length ? (
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
  ) : null
}
