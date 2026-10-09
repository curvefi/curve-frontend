import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { PoolRow, PoolTableMeta } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './RateTooltipItems'
import { getAprCampaigns, getBaseApr, getCrvAprRange, getExtraRewards, getPointsCampaigns } from './utils'

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvRate = pool.gauge?.isKilled ? null : pool.crvApr
  const hasCrvRate = unboostedCrvRate != null && unboostedCrvRate !== 0

  if (!hasCrvRate && !extraRewards.length && !campaigns?.length) return null
  else return { incentivesRate: pool.incentivesApr, extraRewards, campaigns, unboostedCrvRate }
}

const NetRateIncentivesTooltipItems = ({
  items: { incentivesRate, extraRewards, campaigns, unboostedCrvRate },
  blockchainId,
  crvToken,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  blockchainId: string
  crvToken: PoolTableMeta['crvToken']
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Liquidity incentives`}>{formatNumber(incentivesRate, 'percent.rate')}</TooltipItem>
    {!!unboostedCrvRate && (
      <TooltipItem variant="subItem" title="CRV" titleIcon={crvToken && { ...crvToken, size: 'mui-sm' }}>
        {formatNumber(unboostedCrvRate, 'percent.rate')}
      </TooltipItem>
    )}
    <ExtraRewardTooltipItems blockchainId={blockchainId} rewards={extraRewards} />
    {campaigns && <CampaignRewardTooltipItems campaigns={campaigns} />}
  </TooltipItems>
)

export const NetRateTooltipContent = ({
  pool,
  volatile,
  crvToken,
}: {
  pool: PoolRow
  volatile: boolean
  crvToken: PoolTableMeta['crvToken']
}) => {
  const baseRate = getBaseApr(pool, 'daily')
  const netRate = pool.netApr
  const crvRateRange = pool.gauge?.isKilled ? null : getCrvAprRange(pool)
  const maxNetRate = pool.netAprBoosted
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
        {incentiveItems && (
          <NetRateIncentivesTooltipItems items={incentiveItems} blockchainId={pool.blockchainId} crvToken={crvToken} />
        )}
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
                titleIcon={crvToken && { ...crvToken, size: 'mui-sm' }}
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
        {!!pointsCampaigns?.length && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Points campaigns`} />
            <PointsTooltipItems campaigns={pointsCampaigns} />
          </TooltipItems>
        )}
      </Stack>
      {volatile && <TooltipDescription text={t`This net rate is volatile and is unlikely to persist.`} />}
    </TooltipWrapper>
  )
}
