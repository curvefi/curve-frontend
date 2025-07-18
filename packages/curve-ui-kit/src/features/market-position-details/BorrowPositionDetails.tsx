import { Box, Typography } from '@mui/material'
import { Alert } from '@mui/material'
import { BorrowInformation } from '@ui-kit/features/market-position-details/BorrowInformation'
import { HealthDetails } from '@ui-kit/features/market-position-details/HealthDetails'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

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
  isSoftLiquidation: boolean
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

export const BorrowPositionDetails = ({
  isSoftLiquidation,
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
  <Box>
    {isSoftLiquidation && (
      <Box
        sx={{
          paddingTop: Spacing.md,
          paddingRight: Spacing.md,
          paddingLeft: Spacing.md,
        }}
      >
        <Alert variant="filled" severity="error">
          <Box display="flex" flexDirection="column">
            <Typography variant="bodySBold">{t`Soft-Liquidation active`}</Typography>
            <Typography variant="bodyXsRegular">
              {t`Price has entered the liquidation zone and your collateral is at risk. Manage your position to avoid full liquidation.`}
            </Typography>
          </Box>
        </Alert>
      </Box>
    )}
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
  </Box>
)
