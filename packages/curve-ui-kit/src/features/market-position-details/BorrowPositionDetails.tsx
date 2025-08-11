import { Alert, Stack, Typography } from '@mui/material'
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

const LiquidationAlert = ({ type }: { type: 'soft' | 'hard' }) => {
  const alerts = {
    soft: {
      title: t`Soft-Liquidation active`,
      description: t`Price has entered the liquidation zone and your collateral is at risk. Manage your position to avoid full liquidation.`,
    },
    hard: {
      title: t`Your position health is below 0`,
      description: t`It can now be liquidated at any time. To recover remaining collateral (minus fees), repay your debt and withdraw promptly.`,
    },
  }
  const { title, description } = alerts[type]

  return (
    <Stack
      sx={{
        paddingTop: Spacing.md,
        paddingRight: Spacing.md,
        paddingLeft: Spacing.md,
      }}
    >
      <Alert variant="filled" severity="error">
        <Stack display="flex" flexDirection="column">
          <Typography variant="bodySBold">{title}</Typography>
          <Typography variant="bodyXsRegular">{description}</Typography>
        </Stack>
      </Alert>
    </Stack>
  )
}

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
    {liquidationAlert.softLiquidation && <LiquidationAlert type="soft" />}
    {liquidationAlert.hardLiquidation && <LiquidationAlert type="hard" />}
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
