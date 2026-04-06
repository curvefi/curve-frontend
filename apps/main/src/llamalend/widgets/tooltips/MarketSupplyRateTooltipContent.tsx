import type { SupplyExtraIncentive } from '@/llamalend/rates.types'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@ui/utils/utilsFormat'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { AVERAGE_CATEGORIES, formatPercent } from '@ui-kit/utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

type SupplyBoostType = 'max' | 'user'
type SupplyBoost = {
  type: SupplyBoostType
  apy: number | null | undefined
  totalApy: number | null | undefined
  totalAverageApy: number | null | undefined
  // veCRV boost
  value?: number | null | undefined
}
export type MarketSupplyRateTooltipContentProps = {
  supplyApy: number | null | undefined
  averageSupplyApy: number | null | undefined
  periodLabel: string
  extraRewards: CampaignPoolRewards[]
  extraIncentives: SupplyExtraIncentive[]
  totalApy: number | null | undefined
  totalAverageApy: number | null | undefined
  boost: SupplyBoost
  rebasingYieldApy: number | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

const MAX_BOOST = 2.5 as const

const displayBoostValue = (value: number | null | undefined) =>
  value == null ? '' : '(' + formatNumber(value, { maximumFractionDigits: 2 }) + 'x)'

const boostLabels: Record<
  SupplyBoostType,
  { boostApyTitle: (value: number | null | undefined) => string; totalApyTitle: string }
> = {
  max: {
    boostApyTitle: (value) => t`Max veCRV Boost ${displayBoostValue(value)}`,
    totalApyTitle: t`Total max veCRV APY`,
  },
  user: {
    boostApyTitle: (value) => t`Your veCRV boost ${displayBoostValue(value)} `,
    totalApyTitle: t`Total user boosted APY`,
  },
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
  const { boostApyTitle, totalApyTitle } = boostLabels[boost.type]
  const showApyDescription = [extraRewards.length > 0 || extraIncentives.length > 0, rebasingYieldApy != null].some(
    Boolean,
  )
  const hasIncentives = !!(extraRewards.length || extraIncentives.length)
  const hasRebasingYield = rebasingYieldApy != null

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
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageSupplyApy == null ? 'N/A' : formatPercent(averageSupplyApy)}
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
              {formatPercent(rebasingYieldApy)}
            </TooltipItem>
            {!!rebasingSymbol && (
              <TooltipItem variant="subItem" title={rebasingSymbol}>
                {formatPercent(rebasingYieldApy)}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {totalAverageApy != null && (hasIncentives || hasRebasingYield) && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Total APY`} loading={isLoading}>
              {formatPercent(totalApy)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {totalAverageApy == null ? 'N/A' : formatPercent(totalAverageApy)}
            </TooltipItem>
          </TooltipItems>
        )}

        {!!boost.apy && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={boostApyTitle(boost.type === 'max' ? MAX_BOOST : boost.value)} loading={isLoading}>
              {formatPercent(boost.apy)}
            </TooltipItem>
          </TooltipItems>
        )}

        {!!boost.apy && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={totalApyTitle} loading={isLoading}>
              {formatPercent(boost.totalApy)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {boost.totalAverageApy == null ? 'N/A' : formatPercent(boost.totalAverageApy)}
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
