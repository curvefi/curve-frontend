import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { ExtraIncentive } from '@evm-ui/types/market'
import { formatCappedRatePercent, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Nullish } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { COMPOUNDING_CATEGORIES } from '@ui/lib/rates.utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

type SupplyBoostType = 'market' | 'user'
type SupplyBoost = {
  type: SupplyBoostType
  apy: number | Nullish
  totalApy: number | Nullish
  totalAverageApy: number | Nullish
}
type MarketSupplyRateTooltipContentProps = {
  supplyApy: number | Nullish
  averageSupplyApy: number | Nullish
  periodLabel: string
  extraRewards: CampaignRewards[]
  extraIncentives: ExtraIncentive[]
  totalApy: number | Nullish
  totalAverageApy: number | Nullish
  boost: SupplyBoost
  rebasingYieldApy: number | Nullish
  rebasingSymbol?: string | Nullish
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
  const hasIncentives = !!(extraRewards.length || extraIncentives.length)
  const hasRebasingYield = rebasingYieldApy != null
  const showBoostRow = boost.type === 'market' && !!boost.apy

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Supply APY is the estimated earnings related to your share of the pool. It varies according to the market, the monetary policy and the incentives.`}
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
            <TooltipItem title={t`Yield bearing APY`} loading={isLoading}>
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
            <TooltipItem
              title={t`Max veCRV Boost (2.5x)`}
              titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
              loading={isLoading}
              variant="independent"
            >
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

      {(hasIncentives || showBoostRow) && (
        <TooltipFooter>
          {t`Token incentive APY assumes a ${COMPOUNDING_CATEGORIES['llamalend.rewards'].adjective} compounding rate.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}
