import { TOTAL_SUPPLY_APY_TITLE } from '@/llamalend/constants'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { ExtraIncentive } from '@evm-ui/types/market'
import { MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { COMPOUNDING_CATEGORIES, formatCappedRatePercent } from '@ui/lib/rates.utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

type SupplyBoostType = 'market' | 'user'
type SupplyBoost = {
  type: SupplyBoostType
  apy: number | Nullish
  totalApy: number | Nullish
  totalAverageApy: number | Nullish
  multiplier?: Decimal | Nullish
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
  const beta = useNewLlamalendHealth()
  const hasIncentives = !!(extraRewards.length || extraIncentives.length)
  const hasRebasingYield = rebasingYieldApy != null
  const showBoostRow = boost.type === 'market' && !!boost.apy

  if (beta && boost.type === 'user') {
    return (
      <TooltipWrapper>
        <TooltipDescription text={t`Estimated annual yield from supply interest, token yield and eligible rewards.`} />
        <TooltipItems secondary>
          <TooltipItem title={t`Supply APY`} loading={isLoading}>
            {formatCappedRatePercent(supplyApy)}
          </TooltipItem>
          {averageSupplyApy != null && (
            <TooltipItem title={`${periodLabel} ${t`average`}`} variant="subItem" loading={isLoading}>
              {formatCappedRatePercent(averageSupplyApy)}
            </TooltipItem>
          )}
          {hasRebasingYield && (
            <TooltipItem title={t`Token yield APY`} loading={isLoading}>
              {formatCappedRatePercent(rebasingYieldApy)}
              {rebasingSymbol}
            </TooltipItem>
          )}
          {hasIncentives && (
            <RewardsTooltipItems
              title={t`Rewards`}
              tooltipType="supply"
              extraRewards={extraRewards}
              extraIncentives={extraIncentives}
            />
          )}
          <TooltipItem
            title={TOTAL_SUPPLY_APY_TITLE}
            variant="primary"
            loading={isLoading}
            sx={{ borderTop: theme => `1px solid ${theme.design.Layer[3].Outline}`, pt: SizesAndSpaces.Spacing.xs }}
          >
            {formatCappedRatePercent(totalApy)}
          </TooltipItem>
          {boost.multiplier != null && (
            <TooltipItem title={t`veCRV boost`} variant="independent">
              {formatNumber(boost.multiplier, 'multiplier')}
            </TooltipItem>
          )}
        </TooltipItems>
        {hasIncentives && (
          <TooltipFooter>{t`Reward APRs are converted to APY assuming weekly reinvestment; compounding is not automatic.`}</TooltipFooter>
        )}
      </TooltipWrapper>
    )
  }

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          beta
            ? t`Supply APY is estimated earnings related to your share of the pool. It varies with the market, monetary policy, and incentives.`
            : t`The net supply rate is the estimated earnings related to your share of the pool. It varies according to the market, the monetary policy and the incentives.`
        }
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
            <TooltipItem title={beta ? t`Token yield APY` : t`Yield bearing APY`} loading={isLoading}>
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
            <TooltipItem variant="primary" title={beta ? TOTAL_SUPPLY_APY_TITLE : t`Net total APY`} loading={isLoading}>
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
          {beta
            ? t`Token reward APRs are converted to APY assuming weekly reinvestment. Rewards do not compound automatically.`
            : t`Token incentive APY assumes a ${COMPOUNDING_CATEGORIES['llamalend.rewards'].adjective} compounding rate.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}
