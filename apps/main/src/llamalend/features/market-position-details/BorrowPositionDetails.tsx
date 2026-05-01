import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces

export type LiquidationAlert = {
  softLiquidation: boolean
  hardLiquidation: boolean
  status: UserPositionStatus
}
export type Health = { value: number | undefined | null; loading: boolean }
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
export type TotalDebt = { value: number | undefined | null; loading: boolean }

export type BorrowPositionDetailsProps = {
  liquidationAlert: LiquidationAlert
  health: Health
  liquidationRange: LiquidationRange
  bandRange: BandRange
  leverage?: Leverage // doesn't exist yet for crvusd
  collateralValue: CollateralValue
  totalDebt: TotalDebt
}

export const BorrowPositionDetails = ({
  liquidationAlert,
  health,
  liquidationRange,
  bandRange,
  leverage,
  collateralValue,
  totalDebt,
}: BorrowPositionDetailsProps) => {
  const status = liquidationAlert.status
  const statusContent =
    status && getPositionStatusContent(collateralValue.collateral.symbol, collateralValue.borrow.symbol)[status]
  return (
    <Stack padding={Spacing.sm} gap={Spacing.xs}>
      {statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Stack>
            <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
          </Stack>
        </Alert>
      )}
      <Stack gap={Spacing.sm}>
        <HealthDetails health={health} liquidationAlert={liquidationAlert} />
        <BorrowInformation
          collateralValue={collateralValue}
          leverage={leverage}
          liquidationRange={liquidationRange}
          bandRange={bandRange}
          totalDebt={totalDebt}
        />
      </Stack>
    </Stack>
  )
}
