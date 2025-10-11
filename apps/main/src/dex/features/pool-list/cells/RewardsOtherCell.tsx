import { Fragment } from 'react'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { CellContext } from '@tanstack/react-table'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { Address } from '@ui-kit/utils'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy['other']>

export const RewardsOtherCell = ({ getValue, table, column, row: { original: poolData } }: Prop) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })
  const rewards = getValue()
  return (
    <>
      {!!rewards?.length && (
        <div>
          {rewards?.map((o) => (
            <Fragment key={o.tokenAddress}>
              <Chip size="md" isBold={isSortedBy(table, column)}>
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
