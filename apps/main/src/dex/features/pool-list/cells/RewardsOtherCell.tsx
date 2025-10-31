import { Fragment } from 'react'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import PoolRewardsCrv from '@/dex/components/PoolRewardsCrv'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { CellContext } from '@tanstack/react-table'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { Address } from '@ui-kit/utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsOtherCell = ({ getValue, table, column, row: { original: poolData } }: Prop) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })
  const rewards = getValue()
  const { other, crv } = rewards ?? {}
  const isCrvRewardsEnabled = useNetworkFromUrl()?.isCrvRewardsEnabled
  return (
    <>
      {isCrvRewardsEnabled && crv && (
        <PoolRewardsCrv
          poolData={poolData}
          rewardsApy={rewards}
          isHighlight={isSortedBy(table, PoolColumnId.RewardsCrv)}
        />
      )}
      {!!other?.length && (
        <div>
          {other?.map((o) => (
            <Fragment key={o.tokenAddress}>
              <Chip size="md" isBold={isSortedBy(table, PoolColumnId.RewardsIncentives)}>
                {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
              </Chip>
              <br />
            </Fragment>
          ))}
        </div>
      )}
      {campaigns.length > 0 && <CampaignRewardsRow rewardItems={campaigns} />}
    </>
  )
}
