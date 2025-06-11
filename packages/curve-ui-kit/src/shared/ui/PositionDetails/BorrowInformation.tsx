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
} from '@ui-kit/shared/ui/PositionDetails'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type BorrowInformationProps = {
  app: 'crvusd' | 'lend'
  rate: BorrowRate | undefined | null
  pnl: Pnl | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  liquidationThreshold: number | undefined | null
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
        value={Number(rate?.value)}
        loading={rate?.loading}
        unit="percentage"
      />
      {app === 'lend' && <Metric size="small" label={t`PnL`} value={Number(pnl?.value)} loading={pnl?.loading} />}
      <Metric
        size="small"
        label={t`Collateral Value`}
        value={Number(collateralValue?.value)}
        loading={collateralValue?.loading}
        unit="dollar"
      />
      <Metric size="small" label={t`Current LTV`} value={Number(ltv?.value)} loading={ltv?.loading} unit="percentage" />
      {app === 'lend' && (
        <Metric
          size="small"
          label={t`Leverage`}
          value={Number(leverage?.value)}
          loading={leverage?.loading}
          unit="multiplier"
        />
      )}
      {/* <Metric size="small" label={t`Liquidation Range`} value={liquidationRange ? `${liquidationRange[0]} - ${liquidationRange[1]}` : ''} /> */}
      <Metric
        size="small"
        label={t`Liquidation Threshold`}
        abbreviate={false}
        value={liquidationThreshold}
        loading={liquidationRange?.loading}
        unit="dollar"
      />
      <Metric
        size="small"
        label={t`Total Debt`}
        value={Number(totalDebt?.value)}
        loading={totalDebt?.loading}
        unit="dollar"
      />
      <Metric
        size="small"
        label={t`Accrued Interest`}
        value={Number(accruedInterest?.value)}
        loading={accruedInterest?.loading}
        unit="dollar"
      />
    </Box>
  </Box>
)
