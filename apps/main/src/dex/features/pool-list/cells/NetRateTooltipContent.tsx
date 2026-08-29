import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
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
  convertPoolRate,
  getAprCampaigns,
  getBaseRate,
  getCrvRateRange,
  getExtraRewards,
  getNetRate,
  getPointsCampaigns,
  getRewardsRate,
} from './utils'

const getIncentivesItems = (pool: PoolRow, convertAprToApy: ReturnType<typeof useAprToApy>) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvRate = pool.gauge?.isKilled ? null : convertPoolRate(convertAprToApy, pool.crvApr)
  const hasCrvRate = unboostedCrvRate != null && unboostedCrvRate !== 0

  if (!hasCrvRate && !extraRewards.length && !campaigns.length) return null
  else
    return {
      incentivesRate: getRewardsRate(pool, convertAprToApy) + (hasCrvRate ? unboostedCrvRate : 0),
      extraRewards,
      campaigns,
      unboostedCrvRate,
    }
}

export const NetRateIncentivesTooltipItems = ({
  items: { incentivesRate, extraRewards, campaigns, unboostedCrvRate },
  network,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  network: string
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
    <ExtraRewardTooltipItems network={network} rewards={extraRewards} />
    <CampaignRewardTooltipItems campaigns={campaigns} />
  </TooltipItems>
)

export const NetRateTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const baseRate = getBaseRate(pool, 'daily', convertAprToApy)
  const netRate = getNetRate(pool, convertAprToApy)
  const crvRateRange = pool.gauge && !pool.gauge.isKilled ? getCrvRateRange(pool, convertAprToApy) : null
  const maxNetRate = crvRateRange
    ? netRate - crvRateRange.unboostedRate + crvRateRange.boostedRate
    : null
  const incentiveItems = getIncentivesItems(pool, convertAprToApy)
  const pointsCampaigns = getPointsCampaigns(pool)
  const rateLabel = rateDisplay === 'apy' ? t`APY` : t`APR`

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`Estimated net annualized yield from Base APY, unboosted CRV gauge APY, and various reward APYs.`
            : t`Estimated net annualized yield from Base APR, unboosted CRV gauge APR, and various reward APRs.`
        }
      />
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={rateDisplay === 'apy' ? t`Base APY` : t`Base APR`}>
            {formatNumber(baseRate, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
        {incentiveItems && <NetRateIncentivesTooltipItems items={incentiveItems} network={pool.network} />}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Net total ${rateLabel}`}>
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
              <TooltipItem variant="primary" title={t`Total max veCRV ${rateLabel}`}>
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
      {volatile && (
        <TooltipDescription
          text={
            rateDisplay === 'apy'
              ? t`This net APY is volatile and is unlikely to persist.`
              : t`This net APR is volatile and is unlikely to persist.`
          }
        />
      )}
      {incentiveItems && (
        <TooltipFooter>
          {rateDisplay === 'apy'
            ? t`*Token incentive and yield bearing APY assume a ${AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].adjective} compounding rate.`
            : t`*APR values are displayed without compounding.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}
