import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems } from './RateTooltipItems'
import {
  getAprCampaigns,
  getCampaignRewardsRate,
  getExtraRewards,
  getExtraRewardsRate,
  getRewardsRate,
} from './utils'

export const RewardsRateTooltipContent = ({ pool }: { pool: PoolRow }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Annualized yield from extra token rewards and APR campaigns. Points are not included.`}
      />
      <Stack>
        {extraRewards.length > 0 && (
          <TooltipItems secondary>
            <TooltipItem title={t`Liquidity incentives`}>
              {formatNumber(getExtraRewardsRate(pool, convertAprToApy), 'percent.rate')}
            </TooltipItem>
            <ExtraRewardTooltipItems network={pool.network} rewards={extraRewards} />
          </TooltipItems>
        )}
        {campaigns.length > 0 && (
          <TooltipItems secondary>
            <TooltipItem title={t`Campaign rewards`}>
              {formatNumber(getCampaignRewardsRate(pool, convertAprToApy), 'percent.rate')}
            </TooltipItem>
            <CampaignRewardTooltipItems campaigns={campaigns} />
          </TooltipItems>
        )}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={rateDisplay === 'apy' ? t`Rewards APY` : t`Rewards APR`}>
            {formatNumber(getRewardsRate(pool, convertAprToApy), 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
      </Stack>
    </TooltipWrapper>
  )
}
