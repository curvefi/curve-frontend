import { CardHeader, Box } from '@mui/material'
import type { PoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { MarketSupplyRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketSupplyRateTooltipContent'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ExtraIncentive } from '@ui-kit/types/market'
import { formatNumber } from '@ui-kit/utils'
import { AmountSuppliedTooltipContent } from './tooltips/AmountSuppliedTooltipContent'
import { VaultSharesTooltipContent } from './tooltips/VaultSharesTooltipContent'

const { Spacing } = SizesAndSpaces

type SupplyAPY = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null
  averageRebasingYield: number | null
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
  extraRewards: PoolRewards[]
  loading: boolean
}
type Shares = {
  value: number | undefined | null
  staked: number | undefined | null
  loading: boolean
}

// TODO: add when we have boost in llamalend-js
type Boost = {
  value: number | undefined | null
  loading: boolean
}
type SupplyAsset = {
  symbol: string | undefined | null
  address: string | undefined | null
  usdRate: number | undefined | null
  depositedAmount: number | undefined | null
  depositedUsdValue: number | undefined | null
  loading: boolean
}

export type SupplyPositionDetailsProps = {
  supplyAPY: SupplyAPY
  shares: Shares
  supplyAsset: SupplyAsset
}

export const SupplyPositionDetails = ({ supplyAPY, shares, supplyAsset }: SupplyPositionDetailsProps) => {
  const maxApy =
    (supplyAPY?.rate ?? 0) + (supplyAPY?.supplyAprCrvMinBoost ?? 0) + (supplyAPY?.supplyAprCrvMaxBoost ?? 0)

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
          value={supplyAPY?.rate}
          loading={supplyAPY?.rate == null && supplyAPY?.loading}
          valueOptions={{ unit: 'percentage', color: 'warning' }}
          notional={
            maxApy ? t`max Boost ${formatNumber(maxApy, { unit: 'percentage', abbreviate: false })}` : undefined
          }
          valueTooltip={{
            title: t`Supply Rate`,
            body: (
              <MarketSupplyRateTooltipContent
                supplyRate={supplyAPY?.rate}
                averageRate={supplyAPY?.averageRate}
                periodLabel={supplyAPY?.averageRateLabel ?? ''}
                extraRewards={supplyAPY?.extraRewards ?? []}
                extraIncentives={supplyAPY?.extraIncentives ?? []}
                minBoostApr={supplyAPY?.supplyAprCrvMinBoost}
                maxBoostApr={supplyAPY?.supplyAprCrvMaxBoost}
                totalSupplyRateMinBoost={supplyAPY?.totalSupplyRateMinBoost}
                totalSupplyRateMaxBoost={supplyAPY?.totalSupplyRateMaxBoost}
                totalAverageSupplyRateMinBoost={supplyAPY?.totalAverageSupplyRateMinBoost}
                totalAverageSupplyRateMaxBoost={supplyAPY?.totalAverageSupplyRateMaxBoost}
                rebasingYield={supplyAPY?.rebasingYield}
                rebasingSymbol={supplyAsset?.symbol}
                isLoading={supplyAPY?.loading}
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
          value={supplyAsset?.depositedAmount}
          loading={supplyAsset?.depositedAmount == null && supplyAsset?.loading}
          valueOptions={{ unit: 'dollar' }}
          notional={
            supplyAsset?.depositedAmount
              ? {
                  value: supplyAsset.depositedAmount,
                  unit: { symbol: ` ${supplyAsset.symbol}`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Amount Supplied`,
            body: <AmountSuppliedTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Vault shares`}
          value={shares?.value}
          loading={shares?.value == null && shares?.loading}
          valueOptions={{}}
          notional={
            shares.staked && shares.value
              ? {
                  value: (shares.staked / shares.value) * 100,
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
      </Box>
    </Box>
  )
}
