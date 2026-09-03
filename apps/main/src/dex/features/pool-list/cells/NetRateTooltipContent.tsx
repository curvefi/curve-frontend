import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { formatNumber, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './RateTooltipItems'
import {
  getAprCampaigns,
  getBaseApr,
  getCrvAprRange,
  getExtraRewards,
  getNetApr,
  getPointsCampaigns,
  getRewardsApr,
} from './utils'

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvRate = pool.gauge?.isKilled ? null : pool.crvApr
  const hasCrvRate = unboostedCrvRate != null && unboostedCrvRate !== 0

  if (!hasCrvRate && !extraRewards.length && !campaigns.length) return null
  else
    return {
      incentivesRate: getRewardsApr(pool) + (hasCrvRate ? unboostedCrvRate : 0),
      extraRewards,
      campaigns,
      unboostedCrvRate,
    }
}

export const NetRateIncentivesTooltipItems = ({
  items: { incentivesRate, extraRewards, campaigns, unboostedCrvRate },
  blockchainId,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  blockchainId: string
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Liquidity incentives`}>{formatNumber(incentivesRate, 'percent.rate')}</TooltipItem>
    {!!unboostedCrvRate && (
      <TooltipItem
        variant="subItem"
        title="CRV"
        titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
      >
        {formatNumber(unboostedCrvRate, 'percent.rate')}
      </TooltipItem>
    )}
    <ExtraRewardTooltipItems blockchainId={blockchainId} rewards={extraRewards} />
    <CampaignRewardTooltipItems campaigns={campaigns} />
  </TooltipItems>
)

export const NetRateTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const baseRate = getBaseApr(pool, 'daily')
  const netRate = getNetApr(pool)
  const crvRateRange = pool.gauge && !pool.gauge.isKilled ? getCrvAprRange(pool) : null
  const maxNetRate = crvRateRange ? netRate - crvRateRange.unboostedRate + crvRateRange.boostedRate : null
  const incentiveItems = getIncentivesItems(pool)
  const pointsCampaigns = getPointsCampaigns(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated net yield from base APR, unboosted CRV gauge APR, and various reward APRs.`}
      />
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Base APR`}>{formatNumber(baseRate, 'percent.rate')}</TooltipItem>
        </TooltipItems>
        {incentiveItems && <NetRateIncentivesTooltipItems items={incentiveItems} blockchainId={pool.blockchainId} />}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Net total APR`}>
            {formatNumber(netRate, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
        {crvRateRange && (
          <>
            <TooltipItems secondary extraMargin>
              <TooltipItem
                title={t`Max veCRV Boost (2.5x)`}
                titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
                variant="independent"
              >
                {formatNumber(crvRateRange.boostedRate, 'percent.rate')}
              </TooltipItem>
            </TooltipItems>
            <TooltipItems borderTop>
              <TooltipItem variant="primary" title={t`Total max veCRV APR`}>
                {formatNumber(maxNetRate, 'percent.rate')}
              </TooltipItem>
            </TooltipItems>
          </>
        )}
        {pointsCampaigns.length > 0 && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Points campaigns`} />
            <PointsTooltipItems campaigns={pointsCampaigns} />
          </TooltipItems>
        )}
      </Stack>
      {volatile && <TooltipDescription text={t`This net APR is volatile and is unlikely to persist.`} />}
    </TooltipWrapper>
  )
}
