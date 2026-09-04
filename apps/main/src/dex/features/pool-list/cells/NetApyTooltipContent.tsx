import { AVERAGE_CATEGORIES, formatNumber, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './ApyTooltipItems'
import {
  aprToPoolApy,
  getAprCampaigns,
  getBaseApy,
  getCrvApyRange,
  getExtraRewards,
  getNetApy,
  getPointsCampaigns,
  getRewardsApy,
} from './utils'

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvApy = pool.gauge?.isKilled ? null : aprToPoolApy(pool.crvApr)
  const hasCrvApy = unboostedCrvApy != null && unboostedCrvApy !== 0

  if (!hasCrvApy && !extraRewards.length && !campaigns.length) return null
  else
    return {
      incentivesApy: getRewardsApy(pool) + (hasCrvApy ? unboostedCrvApy : 0),
      extraRewards,
      campaigns,
      unboostedCrvApy,
    }
}

export const NetApyIncentivesTooltipItems = ({
  items: { incentivesApy, extraRewards, campaigns, unboostedCrvApy },
  blockchainId,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  blockchainId: string
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Liquidity incentives`}>{formatNumber(incentivesApy, 'percent.rate')}</TooltipItem>
    {!!unboostedCrvApy && (
      <TooltipItem
        variant="subItem"
        title="CRV"
        titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
      >
        {formatNumber(unboostedCrvApy, 'percent.rate')}
      </TooltipItem>
    )}
    <ExtraRewardTooltipItems blockchainId={blockchainId} rewards={extraRewards} />
    <CampaignRewardTooltipItems campaigns={campaigns} />
  </TooltipItems>
)

export const NetApyTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const baseApy = getBaseApy(pool, 'daily')
  const netApy = getNetApy(pool)
  const crvApyRange = pool.gauge && !pool.gauge.isKilled ? getCrvApyRange(pool) : null
  const maxNetApy = crvApyRange ? netApy - crvApyRange.unboostedApy + crvApyRange.boostedApy : null
  const incentiveItems = getIncentivesItems(pool)
  const pointsCampaigns = getPointsCampaigns(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated net annualized yield from Base APY, unboosted CRV gauge APY, and various reward APYs.`}
      />
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Base APY`}>{formatNumber(baseApy, 'percent.rate')}</TooltipItem>
        </TooltipItems>
        {incentiveItems && <NetApyIncentivesTooltipItems items={incentiveItems} blockchainId={pool.blockchainId} />}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Net total APY`}>
            {formatNumber(netApy, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
        {crvApyRange && (
          <>
            <TooltipItems secondary extraMargin>
              <TooltipItem
                title={t`Max veCRV Boost (2.5x)`}
                titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
                variant="independent"
              >
                {formatNumber(crvApyRange.boostedApy, 'percent.rate')}
              </TooltipItem>
            </TooltipItems>
            <TooltipItems borderTop>
              <TooltipItem variant="primary" title={t`Total max veCRV APY`}>
                {formatNumber(maxNetApy, 'percent.rate')}
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
      {volatile && <TooltipDescription text={t`This net APY is volatile and is unlikely to persist.`} />}
      {incentiveItems && (
        <TooltipFooter>
          {t`*Token incentive and yield bearing APY assume a ${AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].adjective} compounding rate.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}
