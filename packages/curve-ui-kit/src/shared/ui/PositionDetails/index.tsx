import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { BorrowInformation } from '@ui-kit/shared/ui/PositionDetails/BorrowInformation'
import { HealthDetails } from '@ui-kit/shared/ui/PositionDetails/HealthDetails'

export type Pnl = { value: string | undefined | null; percentageChange: string | undefined | null; loading: boolean }
export type Health = { value: string | undefined | null; loading: boolean }
export type BorrowRate = { value: string | undefined | null; loading: boolean }
export type AccruedInterest = { value: string | undefined | null; loading: boolean }
export type LiquidationRange = { value: string[] | undefined | null; loading: boolean }
export type Leverage = { value: string | undefined | null; loading: boolean }
export type CollateralValue = { value: string | undefined | null; loading: boolean }
export type Ltv = { value: string | undefined | null; loading: boolean }
export type TotalDebt = { value: string | undefined | null; loading: boolean }

export type PositionDetailsProps = {
  app: 'crvusd' | 'lend'
  health: Health
  borrowRate: BorrowRate
  accruedInterest: AccruedInterest
  pnl?: Pnl // doesn't exist yet for crvusd
  liquidationRange: LiquidationRange
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
      liquidationThreshold={Number(liquidationRange.value?.[1])}
      totalDebt={totalDebt}
      accruedInterest={accruedInterest}
    />
  </Box>
)
