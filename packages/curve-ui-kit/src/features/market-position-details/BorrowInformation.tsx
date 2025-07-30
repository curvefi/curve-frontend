import { CardHeader, Box } from '@mui/material'
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
import { CollateralMetricTooltip } from '@ui-kit/features/market-position-details/tooltips/CollateralMetricTooltip'
import { LiquidityThresholdTooltip } from '@ui-kit/features/market-position-details/tooltips/LiquidityThresholdMetricTooltip'
import { PnlMetricTooltip } from '@ui-kit/features/market-position-details/tooltips/PnlMetricTooltip'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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
  borrowAPY,
  pnl,
  collateralValue,
  ltv,
  leverage,
  liquidationRange,
  bandRange,
  totalDebt,
}: BorrowInformationProps) => (
  <Box>
    <CardHeader title={t`Borrow Information`} size="small" />
    <Box
      display="grid"
      gap={3}
      sx={{
        padding: Spacing.md,
        gridTemplateColumns: '1fr 1fr',
        // 550px
        '@media (min-width: 33.125rem)': {
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
        },
      }}
    >
      <Metric
        size="medium"
        label={t`Borrow rate`}
        value={borrowAPY?.value}
        loading={borrowAPY?.value == null && borrowAPY?.loading}
        valueOptions={{ unit: 'percentage', color: 'warning', decimals: 2 }}
        notional={
          borrowAPY?.thirtyDayAvgRate
            ? {
                value: borrowAPY.thirtyDayAvgRate,
                unit: { symbol: '% 30D Avg', position: 'suffix' },
              }
            : undefined
        }
      />
      <Metric
        size="medium"
        label={t`Total debt`}
        value={totalDebt?.value}
        loading={totalDebt?.value == null && totalDebt?.loading}
        valueOptions={{ unit: { symbol: 'crvUSD', position: 'suffix' } }}
      />
      <Metric
        size="medium"
        label={t`Collateral value`}
        value={collateralValue?.totalValue}
        loading={collateralValue?.totalValue == null && collateralValue?.loading}
        valueOptions={{ unit: 'dollar' }}
        valueTooltip={{
          title: t`Collateral value`,
          body: <CollateralMetricTooltip collateralValue={collateralValue} />,
          placement: 'top',
          arrow: false,
        }}
      />
      <Metric
        size="medium"
        label={t`Current LTV`}
        value={ltv?.value}
        loading={ltv?.value == null && ltv?.loading}
        valueOptions={{ unit: 'percentage', decimals: 2 }}
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
            pnl?.currentPositionValue && pnl?.currentProfit && pnl?.depositedValue ? pnl?.currentProfit : undefined
          }
          loading={pnl?.currentProfit == null && pnl?.loading}
          valueTooltip={{
            title: t`Position PNL`,
            body: <PnlMetricTooltip pnl={pnl} />,
            placement: 'top',
            arrow: false,
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
          title: t`Liquidation threshold`,
          body: <LiquidityThresholdTooltip liquidationRange={liquidationRange} bandRange={bandRange} />,
          placement: 'top',
          arrow: false,
        }}
        notional={
          liquidationRange?.rangeToLiquidation
            ? {
                value: liquidationRange.rangeToLiquidation,
                unit: { symbol: '% Buffer to liquidation', position: 'suffix' },
                decimals: 2,
              }
            : undefined
        }
      />
    </Box>
  </Box>
)
