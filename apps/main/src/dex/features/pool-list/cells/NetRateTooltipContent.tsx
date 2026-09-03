import { t } from '@evm-ui/lib/i18n'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@evm-ui/shared/ui/TooltipComponents'
import { AVERAGE_CATEGORIES, formatNumber, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './RateTooltipItems'
import {
  getAprCampaigns,
  getBaseApr,
  getCrvAprRange,
  getExtraRewards,
  getNetApy,
  getPointsCampaigns,
  getRewardsApr,
} from './utils'

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvApr = pool.gauge?.isKilled ? null : pool.crvApr
  const hasCrvApr = unboostedCrvApr != null && unboostedCrvApr !== 0

  if (!hasCrvApr && !extraRewards.length && !campaigns.length) return null
  else
    return {
      incentivesApr: getRewardsApr(pool) + (hasCrvApr ? unboostedCrvApr : 0),
      extraRewards,
      campaigns,
      unboostedCrvApr,
    }
}

export const NetRateIncentivesTooltipItems = ({
  items: { incentivesApr, extraRewards, campaigns, unboostedCrvApr: unboostedCrvApy },
  blockchainId,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  blockchainId: string
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Liquidity incentives`}>{formatNumber(incentivesApr, 'percent.rate')}</TooltipItem>
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

export const NetRateTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const baseApr = getBaseApr(pool, 'daily')
  const netApy = getNetApy(pool)
  const crvAprRange = pool.gauge && !pool.gauge.isKilled ? getCrvAprRange(pool) : null
  const maxNetApy = crvAprRange ? netApy - crvAprRange.unboostedApr + crvAprRange.boostedApr : null
  const incentiveItems = getIncentivesItems(pool)
  const pointsCampaigns = getPointsCampaigns(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated net yield from Base APR, unboosted CRV gauge APR, and various reward APRs.`}
      />
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Base APR`}>{formatNumber(baseApr, 'percent.rate')}</TooltipItem>
        </TooltipItems>
        {incentiveItems && <NetRateIncentivesTooltipItems items={incentiveItems} blockchainId={pool.blockchainId} />}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Net total APY`}>
            {formatNumber(netApy, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
        {crvAprRange && (
          <>
            <TooltipItems secondary extraMargin>
              <TooltipItem
                title={t`Max veCRV Boost (2.5x)`}
                titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
                variant="independent"
              >
                {formatNumber(crvAprRange.boostedApr, 'percent.rate')}
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
