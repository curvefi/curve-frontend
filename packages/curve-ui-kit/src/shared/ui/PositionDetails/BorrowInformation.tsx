import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type {
  Pnl,
  BorrowRate,
  AccruedInterest,
  LiquidationRange,
  Leverage,
  CollateralValue,
  Ltv,
  TotalDebt,
  LiquidationThreshold,
  App,
} from '@ui-kit/shared/ui/PositionDetails'
import { CollateralMetric } from '@ui-kit/shared/ui/PositionDetails/CollateralMetric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type BorrowInformationProps = {
  app: App
  rate: BorrowRate | undefined | null
  pnl: Pnl | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  liquidationThreshold: LiquidationThreshold | undefined | null
  totalDebt: TotalDebt | undefined | null
  accruedInterest: AccruedInterest | undefined | null
}

export const BorrowInformation = ({
  app,
  rate,
  pnl,
  collateralValue,
  ltv,
  leverage,
  liquidationRange,
  liquidationThreshold,
  totalDebt,
  accruedInterest,
}: BorrowInformationProps) => (
  <Box>
    <CardHeader title={t`Borrow Information`} size="small" />
    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr 1fr" gap={5} sx={{ padding: Spacing.md }}>
      <Metric
        size="small"
        label={t`7D Avg Borrow Rate`}
        value={rate?.value}
        loading={rate?.value == null && rate?.loading}
        unit="percentage"
      />
      {app === 'lend' && (
        <Metric
          size="small"
          label={t`PNL`}
          unit="dollar"
          value={pnl?.value}
          change={pnl?.percentageChange ?? undefined}
          loading={pnl?.value == null && pnl?.loading}
        />
      )}
      <CollateralMetric collateralValue={collateralValue} />
      <Metric
        size="small"
        label={t`Current LTV`}
        value={ltv?.value}
        loading={ltv?.value == null && ltv?.loading}
        unit="percentage"
      />
      {app === 'lend' && leverage?.value && leverage?.value > 1 && (
        <Metric
          size="small"
          label={t`Leverage`}
          value={leverage?.value}
          loading={leverage?.value == null && leverage?.loading}
          unit="multiplier"
        />
      )}
      <Metric
        size="small"
        label={t`Liquidation Range`}
        value={liquidationRange?.value}
        loading={liquidationRange?.value == null && liquidationRange?.loading}
        abbreviate={false}
        unit="dollar"
      />
      <Metric
        size="small"
        label={t`Liquidation Threshold`}
        abbreviate={false}
        value={liquidationThreshold?.value}
        loading={liquidationThreshold?.value == null && liquidationThreshold?.loading}
        unit="dollar"
      />
      <Metric
        size="small"
        label={t`Total Debt`}
        value={totalDebt?.value}
        loading={totalDebt?.value == null && totalDebt?.loading}
        unit="dollar"
      />
      {/* <Metric
        size="small"
        label={t`Accrued Interest`}
        value={accruedInterest?.value)}
        loading={accruedInterest?.value == null && accruedInterest?.loading}
        unit="dollar"
      /> */}
    </Box>
  </Box>
)
