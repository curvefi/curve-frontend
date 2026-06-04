import type { SupplyExtraIncentive } from '@/llamalend/rates.types'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { AVERAGE_CATEGORIES, formatNumber } from '@ui-kit/utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

type SupplyBoostType = 'market' | 'user'
type SupplyBoost = {
  type: SupplyBoostType
  apy: number | null | undefined
  totalApy: number | null | undefined
  totalAverageApy: number | null | undefined
}
type MarketSupplyRateTooltipContentProps = {
  supplyApy: number | null | undefined
  averageSupplyApy: number | null | undefined
  periodLabel: string
  extraRewards: CampaignRewards[]
  extraIncentives: SupplyExtraIncentive[]
  totalApy: number | null | undefined
  totalAverageApy: number | null | undefined
  boost: SupplyBoost
  rebasingYieldApy: number | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

export const MarketSupplyRateTooltipContent = ({
  supplyApy,
  averageSupplyApy,
  periodLabel,
  extraRewards,
  extraIncentives,
  totalApy,
  totalAverageApy,
  boost,
  rebasingYieldApy,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipContentProps) => {
  const showApyDescription = [extraRewards.length, extraIncentives.length, rebasingYieldApy != null].some(Boolean)
  const hasIncentives = !!(extraRewards.length || extraIncentives.length)
  const hasRebasingYield = rebasingYieldApy != null
  const showBoostRow = boost.type === 'market' && !!boost.apy

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The net supply rate is the estimated earnings related to your share of the pool. It varies according to the market, the monetary policy and the incentives.`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Supply APY`} loading={isLoading}>
            {formatNumber(supplyApy, 'percent.rate')}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageSupplyApy == null ? 'N/A' : formatNumber(averageSupplyApy, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>

        {hasIncentives && (
          <TooltipItems secondary>
            <RewardsTooltipItems
              title={t`Lending incentives APY*`}
              tooltipType={'supply'}
              extraRewards={extraRewards}
              extraIncentives={extraIncentives}
            />
          </TooltipItems>
        )}

        {hasRebasingYield && (
          <TooltipItems secondary>
            <TooltipItem title={t`Yield bearing APY*`} loading={isLoading}>
              {formatNumber(rebasingYieldApy, 'percent.rate')}
            </TooltipItem>
            {!!rebasingSymbol && (
              <TooltipItem variant="subItem" title={rebasingSymbol}>
                {formatNumber(rebasingYieldApy, 'percent.rate')}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {totalApy != null && (hasIncentives || hasRebasingYield) && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Net total APY`} loading={isLoading}>
              {formatNumber(totalApy, 'percent.rate')}
            </TooltipItem>
            {/* Historical boost data is only available at the market level, so user totals do not show an average. */}
            {boost.type === 'market' && (
              <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
                {totalAverageApy == null ? 'N/A' : formatNumber(totalAverageApy, 'percent.rate')}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {showBoostRow && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Max veCRV Boost (2.5x)`} loading={isLoading}>
              {formatNumber(boost.apy, 'percent.rate')}
            </TooltipItem>
          </TooltipItems>
        )}

        {showBoostRow && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Total max veCRV APY`} loading={isLoading}>
              {formatNumber(boost.totalApy, 'percent.rate')}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {boost.totalAverageApy == null ? 'N/A' : formatNumber(boost.totalAverageApy, 'percent.rate')}
            </TooltipItem>
          </TooltipItems>
        )}
      </Stack>

      {showApyDescription && (
        <TooltipFooter>
          {t`*Token incentive and yield bearing APY assume a ${AVERAGE_CATEGORIES['llamalend.compoundRate'].adjective} compounding rate.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}
