import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { PoolTableMeta } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './RateTooltipItems'
import type { getNetRateTooltipData } from './utils'

const NetRateIncentivesTooltipItems = ({
  items: { incentivesRate, extraRewards, campaigns, unboostedCrvRate },
  blockchainId,
  crvToken,
}: {
  items: NonNullable<ReturnType<typeof getNetRateTooltipData>['incentiveItems']>
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
  blockchainId,
  baseRate,
  netRate,
  crvRateRange,
  maxNetRate,
  incentiveItems,
  pointsCampaigns,
  volatile,
  crvToken,
}: ReturnType<typeof getNetRateTooltipData> & { volatile: boolean; crvToken: PoolTableMeta['crvToken'] }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Estimated net yield from base APR, unboosted CRV gauge APR, and various reward APRs.`}
    />
    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={t`Base APR`}>{formatNumber(baseRate, 'percent.rate')}</TooltipItem>
      </TooltipItems>
      {incentiveItems && (
        <NetRateIncentivesTooltipItems items={incentiveItems} blockchainId={blockchainId} crvToken={crvToken} />
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
