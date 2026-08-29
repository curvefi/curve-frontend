import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@evm-ui/shared/ui/TooltipComponents'
import type { ExtraIncentive } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, formatCappedRatePercent, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { RewardsTooltipItems } from './RewardTooltipItems'

type SupplyBoostType = 'market' | 'user'
type SupplyBoost = {
  type: SupplyBoostType
  rate: number | null | undefined
  totalRate: number | null | undefined
  totalAverageRate: number | null | undefined
}
type MarketSupplyRateTooltipContentProps = {
  supplyRate: number | null | undefined
  averageSupplyRate: number | null | undefined
  periodLabel: string
  extraRewards: CampaignRewards[]
  extraIncentives: ExtraIncentive[]
  totalRate: number | null | undefined
  totalAverageRate: number | null | undefined
  boost: SupplyBoost
  rebasingYieldRate: number | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

export const MarketSupplyRateTooltipContent = ({
  supplyRate,
  averageSupplyRate,
  periodLabel,
  extraRewards,
  extraIncentives,
  totalRate,
  totalAverageRate,
  boost,
  rebasingYieldRate,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipContentProps) => {
  const rateDisplay = useRateDisplay()
  const showApyDescription =
    rateDisplay === 'apy' && [extraRewards.length, extraIncentives.length, rebasingYieldRate != null].some(Boolean)
  const hasIncentives = !!(extraRewards.length || extraIncentives.length)
  const hasRebasingYield = rebasingYieldRate != null
  const showBoostRow = boost.type === 'market' && !!boost.rate

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The net supply rate is the estimated earnings related to your share of the pool. It varies according to the market, the monetary policy and the incentives.`}
      />

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={rateDisplay === 'apy' ? t`Supply APY` : t`Supply APR`} loading={isLoading}>
            {formatCappedRatePercent(supplyRate)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageSupplyRate == null ? 'N/A' : formatCappedRatePercent(averageSupplyRate)}
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
            <TooltipItem title={rateDisplay === 'apy' ? t`Yield bearing APY*` : t`Yield bearing APR`} loading={isLoading}>
              {formatCappedRatePercent(rebasingYieldRate)}
            </TooltipItem>
            {!!rebasingSymbol && (
              <TooltipItem variant="subItem" title={rebasingSymbol}>
                {formatCappedRatePercent(rebasingYieldRate)}
              </TooltipItem>
            )}
          </TooltipItems>
        )}

        {totalRate != null && (hasIncentives || hasRebasingYield) && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={rateDisplay === 'apy' ? t`Net total APY` : t`Net total APR`} loading={isLoading}>
              {formatCappedRatePercent(totalRate)}
            </TooltipItem>
            {/* Historical boost data is only available at the market level, so user totals do not show an average. */}
            {boost.type === 'market' && (
              <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
                {totalAverageRate == null ? 'N/A' : formatCappedRatePercent(totalAverageRate)}
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
              {formatCappedRatePercent(boost.rate)}
            </TooltipItem>
          </TooltipItems>
        )}

        {showBoostRow && (
          <TooltipItems borderTop>
            <TooltipItem
              variant="primary"
              title={rateDisplay === 'apy' ? t`Total max veCRV APY` : t`Total max veCRV APR`}
              loading={isLoading}
            >
              {formatCappedRatePercent(boost.totalRate)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {boost.totalAverageRate == null ? 'N/A' : formatCappedRatePercent(boost.totalAverageRate)}
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
