import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { CardHeader, Box } from '@mui/material'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ExtraIncentive } from '@ui-kit/types/market'
import { formatNumber } from '@ui-kit/utils'
import { AmountSuppliedTooltipContent } from './tooltips/AmountSuppliedTooltipContent'
import { VaultSharesTooltipContent } from './tooltips/VaultSharesTooltipContent'

const { Spacing } = SizesAndSpaces

type SupplyRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null
  averageRebasingYield: number | null
  userCurrentCRVApr: number | undefined | null
  userTotalCurrentSupplyApr: number | undefined | null
  supplyAprCrvMinBoost: number | undefined | null
  supplyAprCrvMaxBoost: number | undefined | null
  averageSupplyAprCrvMinBoost: number | undefined | null
  averageSupplyAprCrvMaxBoost: number | undefined | null
  //total = rate - rebasingYield + combined extra incentives
  totalSupplyRateMinBoost: number | null
  totalSupplyRateMaxBoost: number | null
  totalAverageSupplyRateMinBoost: number | null
  totalAverageSupplyRateMaxBoost: number | null
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | undefined | null
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type Shares = {
  value: number | undefined | null
  staked: number | undefined | null
  loading: boolean
}
type Boost = {
  value: number | undefined | null
  loading: boolean
}
export type SupplyAsset = {
  symbol: string | undefined | null
  address: string | undefined | null
  usdRate: number | undefined | null
  depositedAmount: number | undefined | null
  depositedUsdValue: number | undefined | null
  loading: boolean
}

export type SupplyPositionDetailsProps = {
  supplyRate: SupplyRate
  shares: Shares
  supplyAsset: SupplyAsset
  boost: Boost
}

export const SupplyPositionDetails = ({ supplyRate, shares, supplyAsset, boost }: SupplyPositionDetailsProps) => {
  const {
    totalSupplyRateMaxBoost,
    totalSupplyRateMinBoost,
    totalAverageSupplyRateMaxBoost,
    totalAverageSupplyRateMinBoost,
    rate,
    averageRate,
    averageRateLabel,
    extraRewards,
    extraIncentives,
    supplyAprCrvMinBoost,
    supplyAprCrvMaxBoost,
    userTotalCurrentSupplyApr,
    loading: supplyRateLoading,
    rebasingYield,
  } = supplyRate
  const { loading: supplyAssetLoading, symbol: supplyAssetSymbol, depositedAmount } = supplyAsset
  const { value: sharesValue, staked: sharesStaked, loading: sharesLoading } = shares
  const { value: boostValue, loading: boostLoading } = boost

  return (
    <Box>
      <CardHeader title={t`Supplying Information`} size="small" />
      <Box
        display="grid"
        gap={3}
        sx={(theme) => ({
          padding: Spacing.md,
          gridTemplateColumns: '1fr 1fr',
          // 550px
          [theme.breakpoints.up(550)]: {
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          },
        })}
      >
        <Metric
          size="medium"
          label={t`Supply rate`}
          value={userTotalCurrentSupplyApr ?? totalSupplyRateMinBoost}
          loading={totalSupplyRateMinBoost == null && supplyRateLoading}
          valueOptions={{ unit: 'percentage', color: 'warning' }}
          notional={
            totalSupplyRateMaxBoost
              ? t`max Boost ${formatNumber(totalSupplyRateMaxBoost, { unit: 'percentage', abbreviate: false })}`
              : undefined
          }
          valueTooltip={{
            title: t`Supply Rate`,
            body: (
              <MarketSupplyRateTooltipContent
                supplyRate={rate}
                averageRate={averageRate}
                periodLabel={averageRateLabel ?? ''}
                extraRewards={extraRewards ?? []}
                extraIncentives={extraIncentives ?? []}
                minBoostApr={supplyAprCrvMinBoost}
                maxBoostApr={supplyAprCrvMaxBoost}
                userBoost={boostValue}
                userTotalCurrentSupplyApr={userTotalCurrentSupplyApr}
                totalSupplyRateMinBoost={totalSupplyRateMinBoost}
                totalSupplyRateMaxBoost={totalSupplyRateMaxBoost}
                totalAverageSupplyRateMinBoost={totalAverageSupplyRateMinBoost}
                totalAverageSupplyRateMaxBoost={totalAverageSupplyRateMaxBoost}
                rebasingYield={rebasingYield}
                rebasingSymbol={supplyAssetSymbol}
                isLoading={supplyRateLoading}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Amount supplied`}
          value={depositedAmount}
          loading={depositedAmount == null && supplyAssetLoading}
          valueOptions={{ unit: 'dollar' }}
          notional={
            depositedAmount
              ? {
                  value: depositedAmount,
                  unit: { symbol: ` ${supplyAssetSymbol}`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Amount Supplied`,
            body: <AmountSuppliedTooltipContent shares={shares} supplyAsset={supplyAsset} />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Vault shares`}
          value={sharesValue}
          loading={sharesValue == null && sharesLoading}
          valueOptions={{}}
          notional={
            sharesStaked && sharesValue
              ? {
                  value: (sharesStaked / sharesValue) * 100,
                  unit: { symbol: t`% staked`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Vault Shares`,
            body: <VaultSharesTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`veCRV Boost`}
          value={boostValue}
          loading={boostValue == null && boostLoading}
          valueOptions={{ unit: 'multiplier' }}
          valueTooltip={{
            title: t`veCRV Boost`,
            body: <BoostTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
      </Box>
    </Box>
  )
}
