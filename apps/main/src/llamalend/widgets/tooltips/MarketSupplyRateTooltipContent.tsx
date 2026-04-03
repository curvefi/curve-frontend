import { COMPOUNDING_CATEGORY } from '@/llamalend/constants'
import { useMarketExtraIncentives } from '@/llamalend/features/market-list/hooks/useMarketExtraIncentives'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketSupplyRateTooltipContentProps = {
  supplyApy: number | null | undefined
  periodLabel: string
  extraRewards: CampaignPoolRewards[]
  extraIncentives: ExtraIncentive[]
  minBoostApy: number | null | undefined
  maxBoostApy: number | null | undefined
  totalApy: number | null | undefined
  totalMaxBoostApy: number | null | undefined
  totalAverageApy: number | null | undefined
  totalAverageMaxBoostApy: number | null | undefined
  rebasingYieldApy: number | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

export const MarketSupplyRateTooltipContent = ({
  supplyApy,
  periodLabel,
  extraRewards,
  extraIncentives,
  minBoostApy,
  maxBoostApy,
  totalApy,
  totalMaxBoostApy,
  totalAverageApy,
  totalAverageMaxBoostApy,
  rebasingYieldApy,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipContentProps) => {
  const extraIncentivesFormatted = useMarketExtraIncentives(MarketRateType.Supply, extraIncentives, minBoostApy)
  const showApyDescription = [
    extraRewards.length > 0 || extraIncentivesFormatted.length > 0,
    rebasingYieldApy != null,
  ].some(Boolean)
  const { adjective: compoundingAdjective } = COMPOUNDING_CATEGORY

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The net supply rate is the estimated earnings related to your share of the pool. It varies according to the market, the monetary policy and the incentives.`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Supply APY`} loading={isLoading}>
            {formatPercent(supplyApy)}
          </TooltipItem>
        </TooltipItems>

        {(extraRewards.length > 0 || extraIncentivesFormatted.length > 0) && (
          <TooltipItems secondary>
            <RewardsTooltipItems
              title={t`Lending incentives APY*`}
              tooltipType={'supply'}
              extraRewards={extraRewards}
              extraIncentives={extraIncentivesFormatted}
              showZeroValue
            />
          </TooltipItems>
        )}

        {rebasingYieldApy != null && (
          <TooltipItems secondary>
            <TooltipItem title={t`Yield bearing APY*`} loading={isLoading}>
              {formatPercent(rebasingYieldApy)}
            </TooltipItem>
            {!!rebasingSymbol && (
              <TooltipItem variant="subItem" title={rebasingSymbol}>
                {formatPercent(rebasingYieldApy)}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Total APY`} loading={isLoading}>
            {formatPercent(totalApy)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {totalAverageApy == null ? 'N/A' : formatPercent(totalAverageApy)}
          </TooltipItem>
        </TooltipItems>

        {maxBoostApy != null && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Max veCRV Boost (2.5x)`} loading={isLoading}>
              {formatPercent(maxBoostApy)}
            </TooltipItem>
          </TooltipItems>
        )}

        {maxBoostApy != null && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Total max veCRV APY`} loading={isLoading}>
              {formatPercent(totalMaxBoostApy)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {totalAverageMaxBoostApy == null ? 'N/A' : formatPercent(totalAverageMaxBoostApy)}
            </TooltipItem>
          </TooltipItems>
        )}
      </Stack>

      {showApyDescription && (
        <TooltipDescription
          text={t`*Token incentive and yield bearing APY assume a ${compoundingAdjective} compounding rate.`}
        />
      )}
    </TooltipWrapper>
  )
}
