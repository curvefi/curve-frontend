import { Stack, Typography } from '@mui/material'
import { Alert } from '@mui/material'
import { BorrowInformation } from '@ui-kit/features/market-position-details/BorrowInformation'
import { HealthDetails } from '@ui-kit/features/market-position-details/HealthDetails'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export type LiquidationAlert = {
  softLiquidation: boolean
  hardLiquidation: boolean
}
export type Pnl = {
  currentProfit: number | undefined | null
  currentPositionValue: number | undefined | null
  depositedValue: number | undefined | null
  percentageChange: number | undefined | null
  loading: boolean
}
export type Health = { value: number | undefined | null; loading: boolean }
export type BorrowAPY = {
  value: number | undefined | null
  thirtyDayAvgRate: number | undefined | null
  loading: boolean
}
export type LiquidationRange = {
  value: number[] | undefined | null
  rangeToLiquidation: number | undefined | null
  loading: boolean
}
export type BandRange = { value: number[] | undefined | null; loading: boolean }
export type Leverage = { value: number | undefined | null; loading: boolean }
export type CollateralValue = {
  totalValue: number | undefined | null
  collateral: {
    value: number | undefined | null
    usdRate: number | undefined | null
    symbol: string | undefined
  }
  borrow: {
    value: number | undefined | null
    usdRate: number | undefined | null
    symbol: string | undefined
  }
  loading: boolean
}
export type Ltv = { value: number | undefined | null; loading: boolean }
export type TotalDebt = { value: number | undefined | null; loading: boolean }

export type BorrowPositionDetailsProps = {
  liquidationAlert: LiquidationAlert
  health: Health
  borrowAPY: BorrowAPY
  pnl?: Pnl // doesn't exist yet for crvusd
  liquidationRange: LiquidationRange
  bandRange: BandRange
  leverage?: Leverage // doesn't exist yet for crvusd
  collateralValue: CollateralValue
  ltv: Ltv
  totalDebt: TotalDebt
}

const SoftLiquidationAlert = () => (
  <Stack
    sx={{
      paddingTop: Spacing.md,
      paddingRight: Spacing.md,
      paddingLeft: Spacing.md,
    }}
  >
    <Alert variant="filled" severity="error">
      <Stack display="flex" flexDirection="column">
        <Typography variant="bodySBold">{t`Soft-Liquidation active`}</Typography>
        <Typography variant="bodyXsRegular">
          {t`Price has entered the liquidation zone and your collateral is at risk. Manage your position to avoid full liquidation.`}
        </Typography>
      </Stack>
    </Alert>
  </Stack>
)
const HardLiquidationAlert = () => (
  <Stack
    sx={{
      paddingTop: Spacing.md,
      paddingRight: Spacing.md,
      paddingLeft: Spacing.md,
    }}
  >
    <Alert variant="filled" severity="error">
      <Stack display="flex" flexDirection="column">
        <Typography variant="bodySBold">{t`Risk of hard liquidation`}</Typography>
        <Typography variant="bodyXsRegular">
          {t`Your position is at risk of being fully liquidated. Manage your position to avoid hard liquidation.`}
        </Typography>
      </Stack>
    </Alert>
  </Stack>
)

export const BorrowPositionDetails = ({
  liquidationAlert,
  health,
  borrowAPY,
  pnl,
  liquidationRange,
  bandRange,
  leverage,
  collateralValue,
  ltv,
  totalDebt,
}: BorrowPositionDetailsProps) => (
  <Stack>
    {liquidationAlert.softLiquidation && <SoftLiquidationAlert />}
    {liquidationAlert.hardLiquidation && <HardLiquidationAlert />}
    <HealthDetails health={health} />
    <BorrowInformation
      borrowAPY={borrowAPY}
      pnl={pnl}
      collateralValue={collateralValue}
      ltv={ltv}
      leverage={leverage}
      liquidationRange={liquidationRange}
      bandRange={bandRange}
      totalDebt={totalDebt}
    />
  </Stack>
)
