import { Fragment } from 'react'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import PoolRewardsCrv from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { Address } from '@ui-kit/utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsOtherCell = ({ getValue, table, row: { original: poolData } }: Prop) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })
  const rewards = getValue()
  const { other, crv } = rewards ?? {}
  return (
    <>
      {crv && (
        <PoolRewardsCrv
          poolData={poolData}
          rewardsApy={rewards}
          isHighlight={isSortedBy(table, PoolColumnId.RewardsCrv)}
        />
      )}
      {other?.map((o) => (
        <Typography
          fontWeight={isSortedBy(table, PoolColumnId.RewardsIncentives) ? 'bold' : 'normal'}
          key={o.tokenAddress}
        >
          {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
        </Typography>
      ))}
      {campaigns.length > 0 && <CampaignRewardsRow rewardItems={campaigns} />}
      {!crv && !other?.length && !campaigns.length && '-'}
    </>
  )
}
