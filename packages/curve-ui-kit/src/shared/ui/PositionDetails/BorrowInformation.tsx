import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type {
  Pnl,
  BorrowAPR,
  Leverage,
  CollateralValue,
  Ltv,
  TotalDebt,
  LiquidationRange,
  BandRange,
} from '@ui-kit/shared/ui/PositionDetails'
import { CollateralMetricTooltip } from '@ui-kit/shared/ui/PositionDetails/tooltips/CollateralMetricTooltip'
import { LiquidityThresholdTooltip } from '@ui-kit/shared/ui/PositionDetails/tooltips/LiquidityThresholdMetricTooltip'
import { PnlMetricTooltip } from '@ui-kit/shared/ui/PositionDetails/tooltips/PnlMetricTooltip'
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
  borrowAPR: BorrowAPR | undefined | null
  pnl: Pnl | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  bandRange: BandRange | undefined | null
  totalDebt: TotalDebt | undefined | null
}

export const BorrowInformation = ({
  borrowAPR,
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
    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr 1fr" gap={5} sx={{ padding: Spacing.md }}>
      <Metric
        size="small"
        label={t`Borrow APR`}
        value={borrowAPR?.value}
        loading={borrowAPR?.value == null && borrowAPR?.loading}
        valueOptions={{ unit: 'percentage', color: 'warning' }}
        notional={
          borrowAPR?.thirtyDayAvgRate
            ? {
                value: borrowAPR.thirtyDayAvgRate,
                unit: { symbol: '% 30D Avg', position: 'suffix' },
              }
            : undefined
        }
      />
      {pnl && ( // PNL is only available on lend for now
        <Metric
          size="small"
          label={t`PNL`}
          valueOptions={{ unit: 'dollar' }}
          value={pnl?.currentProfit}
          change={pnl?.percentageChange ?? undefined}
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
        size="small"
        label={t`Current LTV`}
        value={ltv?.value}
        loading={ltv?.value == null && ltv?.loading}
        valueOptions={{ unit: 'percentage' }}
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
              }
            : undefined
        }
      />
      <Metric
        size="small"
        label={t`Total debt`}
        value={totalDebt?.value}
        loading={totalDebt?.value == null && totalDebt?.loading}
        valueOptions={{ unit: 'dollar' }}
      />
    </Box>
  </Box>
)
