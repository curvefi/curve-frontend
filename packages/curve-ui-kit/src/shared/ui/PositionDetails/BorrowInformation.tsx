import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type {
  Pnl,
  BorrowRate,
  Leverage,
  CollateralValue,
  Ltv,
  TotalDebt,
  LiquidationThreshold,
  App,
} from '@ui-kit/shared/ui/PositionDetails'
import { CollateralMetricTooltip } from '@ui-kit/shared/ui/PositionDetails/tooltips/CollateralMetricTooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type BorrowInformationProps = {
  app: App
  rate: BorrowRate | undefined | null
  pnl: Pnl | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationThreshold: LiquidationThreshold | undefined | null
  totalDebt: TotalDebt | undefined | null
}

export const BorrowInformation = ({
  app,
  rate,
  pnl,
  collateralValue,
  ltv,
  leverage,
  liquidationThreshold,
  totalDebt,
}: BorrowInformationProps) => (
  <Box>
    <CardHeader title={t`Borrow Information`} size="small" />
    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr 1fr" gap={5} sx={{ padding: Spacing.md }}>
      <Metric
        size="small"
        label={t`7D Avg Borrow Rate`}
        value={rate?.value}
        loading={rate?.value == null && rate?.loading}
        valueOptions={{ unit: 'percentage' }}
      />
      {app === 'lend' && (
        <Metric
          size="small"
          label={t`PNL`}
          valueOptions={{ unit: 'dollar' }}
          value={pnl?.value}
          change={pnl?.percentageChange ?? undefined}
          loading={pnl?.value == null && pnl?.loading}
        />
      )}
      <Metric
        size="small"
        label={t`Collateral Value`}
        value={collateralValue?.totalValue}
        loading={collateralValue?.totalValue == null && collateralValue?.loading}
        valueOptions={{ unit: 'dollar' }}
        valueTooltip={{
          title: t`Collateral Value`,
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
      {app === 'lend' && leverage?.value && leverage?.value > 1 && (
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
        label={t`Liquidation Threshold`}
        value={liquidationThreshold?.value}
        loading={liquidationThreshold?.value == null && liquidationThreshold?.loading}
        valueOptions={{ unit: 'dollar' }}
      />
      <Metric
        size="small"
        label={t`Total Debt`}
        value={totalDebt?.value}
        loading={totalDebt?.value == null && totalDebt?.loading}
        valueOptions={{ unit: 'dollar' }}
      />
    </Box>
  </Box>
)
