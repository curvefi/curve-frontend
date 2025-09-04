import { CardHeader, Stack } from '@mui/material'
import type {
  Pnl,
  BorrowAPY,
  Leverage,
  CollateralValue,
  Ltv,
  TotalDebt,
  LiquidationRange,
  BandRange,
} from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { CollateralMetricTooltipContent } from '@ui-kit/features/market-position-details/tooltips/CollateralMetricTooltipContent'
import { CurrentLTVTooltipContent } from '@ui-kit/features/market-position-details/tooltips/CurrentLTVTooltipContent'
import { LiquidityThresholdTooltipContent } from '@ui-kit/features/market-position-details/tooltips/LiquidityThresholdMetricTooltipContent'
import { PnlMetricTooltipContent } from '@ui-kit/features/market-position-details/tooltips/PnlMetricTooltipContent'
import { TotalDebtTooltipContent } from '@ui-kit/features/market-position-details/tooltips/TotalDebtTooltipContent'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { MarketBorrowRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketBorrowRateTooltipContent'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketType } from '@ui-kit/types/market'

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
  borrowAPY: BorrowAPY | undefined | null
  pnl: Pnl | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  bandRange: BandRange | undefined | null
  totalDebt: TotalDebt | undefined | null
}

export const BorrowInformation = ({
  marketType,
  borrowAPY,
  pnl,
  collateralValue,
  ltv,
  leverage,
  liquidationRange,
  bandRange,
  totalDebt,
}: BorrowInformationProps) => (
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
      <Metric
        size="medium"
        label={t`Borrow rate`}
        value={borrowAPY?.totalBorrowRate}
        loading={borrowAPY?.totalBorrowRate == null && borrowAPY?.loading}
        valueOptions={{ unit: 'percentage', color: 'warning' }}
        notional={
          borrowAPY?.totalAverageBorrowRate
            ? {
                value: borrowAPY.totalAverageBorrowRate,
                unit: { symbol: '% 30D Avg', position: 'suffix' },
              }
            : undefined
        }
        valueTooltip={{
          title: t`Borrow Rate`,
          body: (
            <MarketBorrowRateTooltipContent
              marketType={marketType}
              borrowRate={borrowAPY?.rate}
              totalBorrowRate={borrowAPY?.totalBorrowRate}
              totalAverageBorrowRate={borrowAPY?.totalAverageBorrowRate}
              averageRate={borrowAPY?.averageRate}
              rebasingYield={borrowAPY?.rebasingYield}
              collateralSymbol={collateralValue?.collateral?.symbol}
              periodLabel={borrowAPY?.averageRateLabel ?? ''}
              extraRewards={borrowAPY?.extraRewards ?? []}
            />
          ),
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
      />
      <Metric
        size="medium"
        label={t`Total debt`}
        value={totalDebt?.value}
        loading={totalDebt?.value == null && totalDebt?.loading}
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
        loading={collateralValue?.totalValue == null && collateralValue?.loading}
        valueOptions={{ unit: 'dollar' }}
        valueTooltip={{
          title: t`Collateral value`,
          body: <CollateralMetricTooltipContent collateralValue={collateralValue} />,
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
      />
      <Metric
        size="medium"
        label={t`Current LTV`}
        value={ltv?.value}
        loading={ltv?.value == null && ltv?.loading}
        valueOptions={{ unit: 'percentage' }}
        valueTooltip={{
          title: t`Current LTV (Loan To Value ratio)`,
          body: <CurrentLTVTooltipContent />,
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
      />
      {leverage &&
        leverage?.value &&
        leverage?.value > 1 && ( // Leverage is only available on lend for now
          <Metric
            size="small"
            label={t`Leverage`}
            value={leverage?.value}
            loading={leverage?.value == null && leverage?.loading}
            valueOptions={{ unit: 'multiplier' }}
          />
        )}
      {pnl && ( // PNL is only available on lend for now
        // Checking if currentPositionValue exists, otherwise pnl will return currentProfit as depositedValue
        <Metric
          size="small"
          label={t`PNL`}
          valueOptions={{ unit: 'dollar' }}
          value={
            pnl?.currentPositionValue && pnl?.currentProfit && pnl?.depositedValue ? pnl?.currentProfit : undefined
          }
          change={
            pnl?.currentPositionValue && pnl?.percentageChange && pnl?.depositedValue
              ? pnl?.percentageChange
              : undefined
          }
          loading={pnl?.currentProfit == null && pnl?.loading}
          valueTooltip={{
            title: t`Position PNL`,
            body: <PnlMetricTooltipContent pnl={pnl} />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
      )}
      <Metric
        size="small"
        label={t`Liquidation threshold`}
        value={liquidationRange?.value?.[1]}
        loading={liquidationRange?.value == null && liquidationRange?.loading}
        valueOptions={dollarUnitOptions}
        valueTooltip={{
          title: t`Liquidation Threshold (LT)`,
          body: (
            <LiquidityThresholdTooltipContent
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
