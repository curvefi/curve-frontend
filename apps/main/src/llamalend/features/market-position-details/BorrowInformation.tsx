import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { CardHeader, Stack } from '@mui/material'
import { useMarketPageHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketType } from '@ui-kit/types/market'
import {
  LiquidationThresholdTooltipContent,
  type BorrowRate,
  type Leverage,
  type CollateralValue,
  type Ltv,
  type TotalDebt,
  type LiquidationRange,
  type BandRange,
  type CollateralLoss,
} from './'

const { Spacing } = SizesAndSpaces

const dollarUnitOptions = {
  abbreviate: false,
  unit: {
    symbol: '$',
    position: 'prefix' as const,
    abbreviate: false,
  },
}

type BorrowInformationProps = {
  marketType: LlamaMarketType
  borrowRate: BorrowRate | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  bandRange: BandRange | undefined | null
  totalDebt: TotalDebt | undefined | null
  collateralLoss: CollateralLoss | undefined | null
}

export const BorrowInformation = ({
  marketType,
  borrowRate,
  collateralValue,
  ltv,
  leverage,
  liquidationRange,
  bandRange,
  totalDebt,
  collateralLoss,
}: BorrowInformationProps) => {
  const showPageHeader = useMarketPageHeader()

  return (
    <Stack>
      <CardHeader title={t`Borrow Information`} size="small" />
      <Stack
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
        {!showPageHeader && (
          <Metric
            size="medium"
            label={t`Net borrow APR`}
            value={borrowRate?.totalBorrowRate}
            loading={borrowRate?.loading}
            valueOptions={{ unit: 'percentage', color: 'warning' }}
            notional={
              borrowRate?.totalAverageBorrowRate
                ? {
                    value: borrowRate.totalAverageBorrowRate,
                    unit: { symbol: '% 30D Avg', position: 'suffix' },
                  }
                : undefined
            }
            valueTooltip={{
              title: t`Net borrow APR`,
              body: (
                <MarketNetBorrowAprTooltipContent
                  marketType={marketType}
                  borrowRate={borrowRate?.rate}
                  totalBorrowRate={borrowRate?.totalBorrowRate}
                  totalAverageBorrowRate={borrowRate?.totalAverageBorrowRate}
                  averageRate={borrowRate?.averageRate}
                  rebasingYield={borrowRate?.rebasingYield}
                  collateralSymbol={collateralValue?.collateral?.symbol}
                  periodLabel={borrowRate?.averageRateLabel ?? ''}
                  extraRewards={borrowRate?.extraRewards ?? []}
                />
              ),
              placement: 'top',
              arrow: false,
              clickable: true,
            }}
          />
        )}
        <Metric
          size="medium"
          label={t`Total debt`}
          value={totalDebt?.value}
          loading={totalDebt?.loading}
          valueOptions={{ unit: { symbol: 'crvUSD', position: 'suffix' } }}
          valueTooltip={{
            title: t`Total Debt`,
            body: <TotalDebtTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Collateral value`}
          value={collateralValue?.totalValue}
          loading={collateralValue?.loading}
          valueOptions={{ unit: 'dollar' }}
          valueTooltip={{
            title: t`Collateral value`,
            body: <CollateralMetricTooltipContent collateralValue={collateralValue} collateralLoss={collateralLoss} />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Current LTV`}
          value={ltv?.value}
          loading={ltv?.loading}
          valueOptions={{ unit: 'percentage' }}
          valueTooltip={{
            title: t`Current LTV (Loan To Value ratio)`,
            body: <CurrentLTVTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        {leverage?.value != null &&
          leverage?.value > 1 && ( // Leverage is only available on lend for now
            <Metric
              size="small"
              label={t`Leverage`}
              value={leverage?.value}
              loading={leverage?.loading}
              valueOptions={{ unit: 'multiplier' }}
            />
          )}
        <Metric
          size="small"
          label={t`Liquidation threshold`}
          value={liquidationRange?.value?.[1]}
          loading={liquidationRange?.loading}
          valueOptions={dollarUnitOptions}
          valueTooltip={{
            title: t`Liquidation Threshold (LT)`,
            body: (
              <LiquidationThresholdTooltipContent
                liquidationRange={liquidationRange}
                rangeToLiquidation={liquidationRange?.rangeToLiquidation}
                bandRange={bandRange}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
          notional={
            liquidationRange?.rangeToLiquidation
              ? {
                  value: liquidationRange.rangeToLiquidation,
                  unit: {
                    symbol: `% distance to LT`,
                    position: 'suffix',
                  },
                }
              : undefined
          }
        />
      </Stack>
    </Stack>
  )
}
