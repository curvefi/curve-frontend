import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems } from './RateTooltipItems'
import { getAprCampaigns, getCampaignRewardsApr, getExtraRewards, getExtraRewardsApr, getRewardsApy } from './utils'

export const RewardsRateTooltipContent = ({ pool }: { pool: PoolRow }) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription text={t`Yield from extra token rewards and APR campaigns. Points are not included.`} />
      <Stack>
        {extraRewards.length > 0 && (
          <TooltipItems secondary>
            <TooltipItem title={t`Liquidity incentives`}>
              {formatNumber(getExtraRewardsApr(pool), 'percent.rate')}
            </TooltipItem>
            <ExtraRewardTooltipItems blockchainId={pool.blockchainId} rewards={extraRewards} />
          </TooltipItems>
        )}
        {campaigns.length > 0 && (
          <TooltipItems secondary>
            <TooltipItem title={t`Campaign rewards`}>
              {formatNumber(getCampaignRewardsApr(pool), 'percent.rate')}
            </TooltipItem>
            <CampaignRewardTooltipItems campaigns={campaigns} />
          </TooltipItems>
        )}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Rewards APY`}>
            {formatNumber(getRewardsApy(pool), 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
      </Stack>
    </TooltipWrapper>
  )
}
