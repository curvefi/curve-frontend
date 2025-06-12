import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { BorrowInformation } from '@ui-kit/shared/ui/PositionDetails/BorrowInformation'
import { HealthDetails } from '@ui-kit/shared/ui/PositionDetails/HealthDetails'

export type Pnl = { value: number | undefined | null; percentageChange: number | undefined | null; loading: boolean }
export type Health = { value: number | undefined | null; loading: boolean }
export type BorrowRate = { value: number | undefined | null; loading: boolean }
export type AccruedInterest = { value: number | undefined | null; loading: boolean }
export type LiquidationRange = { value: number[] | undefined | null; loading: boolean }
export type LiquidationThreshold = { value: number | undefined | null; loading: boolean }
export type Leverage = { value: number | undefined | null; loading: boolean }
export type CollateralValue = { value: number | undefined | null; loading: boolean }
export type Ltv = { value: number | undefined | null; loading: boolean }
export type TotalDebt = { value: number | undefined | null; loading: boolean }

export type PositionDetailsProps = {
  app: 'crvusd' | 'lend'
  health: Health
  borrowRate: BorrowRate
  accruedInterest?: AccruedInterest // doesn't yet exist on API for any app
  pnl?: Pnl // doesn't exist yet for crvusd
  liquidationRange: LiquidationRange
  liquidationThreshold: LiquidationThreshold
  leverage?: Leverage // doesn't exist yet for crvusd
  collateralValue: CollateralValue
  ltv: Ltv
  totalDebt: TotalDebt
}

export const PositionDetails = ({
  app,
  health,
  borrowRate,
  accruedInterest,
  pnl,
  liquidationRange,
  liquidationThreshold,
  leverage,
  collateralValue,
  ltv,
  totalDebt,
}: PositionDetailsProps) => (
  <Box>
    <CardHeader title={t`Your Position Details`} />
    <HealthDetails health={health} />
    <BorrowInformation
      app={app}
      rate={borrowRate}
      pnl={pnl}
      collateralValue={collateralValue}
      ltv={ltv}
      leverage={leverage}
      liquidationRange={liquidationRange}
      liquidationThreshold={liquidationThreshold}
      totalDebt={totalDebt}
      accruedInterest={accruedInterest}
    />
  </Box>
)
