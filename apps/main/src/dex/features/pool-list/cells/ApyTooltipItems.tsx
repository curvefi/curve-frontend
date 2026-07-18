import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TooltipItem, TooltipItems } from '@ui-kit/shared/ui/TooltipComponents'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import {
  aprToPoolApy,
  getAprCampaigns,
  getCampaignRewardsApy,
  getExtraRewards,
  getExtraRewardsApy,
  getRewardsApy,
} from './utils'

const formatApy = (apy: number | null | undefined) => formatNumber(apy || null, 'percent.rate')

export const RewardsApyTooltipItems = ({ pool, showTotal = true }: { pool: PoolRow; showTotal?: boolean }) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)

  return (
    <>
      {extraRewards.length > 0 && (
        <TooltipItems secondary>
          <TooltipItem title={t`Direct incentives APY`}>{formatApy(getExtraRewardsApy(pool))}</TooltipItem>
          {extraRewards.map((reward, index) => (
            <TooltipItem
              // eslint-disable-next-line @eslint-react/no-array-index-key -- API reward rows do not provide a stable unique id and duplicates must remain visible.
              key={`${reward.address}-${reward.symbol}-${index}`}
              variant="subItem"
              title={reward.symbol || reward.name || t`Extra reward`}
              titleIcon={
                reward.address ? { blockchainId: pool.network, address: reward.address, size: 'mui-sm' } : undefined
              }
            >
              {formatApy(aprToPoolApy(reward.apr))}
            </TooltipItem>
          ))}
        </TooltipItems>
      )}
      {campaigns.length > 0 && (
        <TooltipItems secondary>
          <TooltipItem title={t`Campaign rewards APY`}>{formatApy(getCampaignRewardsApy(pool))}</TooltipItem>
          {campaigns.map((campaign, index) => (
            <TooltipItem
              // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct rewards with the same platform metadata.
              key={`${campaign.platform}-${campaign.description}-${index}`}
              variant="subItem"
              title={campaign.symbol || campaign.campaignName || campaign.platform || t`Campaign reward`}
              titleAdornment={
                <RewardIcon
                  src={campaign.platformImageId}
                  alt={campaign.platform}
                  size="sm"
                  sx={{ borderRadius: '50%' }}
                />
              }
            >
              {formatApy(campaign.reward?.type === 'apr' ? aprToPoolApy(campaign.reward.value) : null)}
            </TooltipItem>
          ))}
        </TooltipItems>
      )}
      {showTotal && (
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Rewards APY`}>
            {formatApy(getRewardsApy(pool))}
          </TooltipItem>
        </TooltipItems>
      )}
    </>
  )
}

export const GaugeApyTooltipItems = ({
  maximumApy,
  showMaximum = true,
  unboostedApy,
}: {
  maximumApy?: number | null
  showMaximum?: boolean
  unboostedApy: number | null | undefined
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Gauge APY`} />
    <TooltipItem
      variant="subItem"
      title={t`Unboosted`}
      titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
    >
      {formatApy(unboostedApy)}
    </TooltipItem>
    {showMaximum && (
      <TooltipItem
        variant="subItem"
        title={t`Maximum`}
        titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
      >
        {formatApy(maximumApy)}
      </TooltipItem>
    )}
  </TooltipItems>
)
