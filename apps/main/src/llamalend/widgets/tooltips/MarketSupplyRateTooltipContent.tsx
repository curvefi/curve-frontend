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
import type { ExtraIncentive } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES, formatCappedRatePercent } from '@ui-kit/utils'
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
  extraIncentives: ExtraIncentive[]
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
            {formatCappedRatePercent(supplyApy)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageSupplyApy == null ? 'N/A' : formatCappedRatePercent(averageSupplyApy)}
          </TooltipItem>
        </TooltipItems>

        {hasIncentives && (
          <TooltipItems secondary>
            <RewardsTooltipItems
              title={t`Supplying incentives`}
              tooltipType="supply"
              extraRewards={extraRewards}
              extraIncentives={extraIncentives}
            />
          </TooltipItems>
        )}

        {hasRebasingYield && (
          <TooltipItems secondary>
            <TooltipItem title={t`Yield bearing APY*`} loading={isLoading}>
              {formatCappedRatePercent(rebasingYieldApy)}
            </TooltipItem>
            {!!rebasingSymbol && (
              <TooltipItem variant="subItem" title={rebasingSymbol}>
                {formatCappedRatePercent(rebasingYieldApy)}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {totalApy != null && (hasIncentives || hasRebasingYield) && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Net total APY`} loading={isLoading}>
              {formatCappedRatePercent(totalApy)}
            </TooltipItem>
            {/* Historical boost data is only available at the market level, so user totals do not show an average. */}
            {boost.type === 'market' && (
              <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
                {totalAverageApy == null ? 'N/A' : formatCappedRatePercent(totalAverageApy)}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {showBoostRow && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Max veCRV Boost (2.5x)`} loading={isLoading}>
              {formatCappedRatePercent(boost.apy)}
            </TooltipItem>
          </TooltipItems>
        )}

        {showBoostRow && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Total max veCRV APY`} loading={isLoading}>
              {formatCappedRatePercent(boost.totalApy)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {boost.totalAverageApy == null ? 'N/A' : formatCappedRatePercent(boost.totalAverageApy)}
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
