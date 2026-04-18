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
  status: UserPositionStatus | undefined
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

const LiquidationAlert = ({
  type,
  collateralSymbol,
  borrowSymbol,
}: {
  type: Exclude<UserPositionStatus, 'healthy' | 'closeToLiquidation'>
  collateralSymbol: string | undefined
  borrowSymbol: string | undefined
}) => {
  const content = getPositionStatusContent(collateralSymbol, borrowSymbol)
  const { title, description, severity } = content[type]

  return (
    <Alert variant="outlined" severity={severity}>
      <AlertTitle>{title}</AlertTitle>
      <Stack>
        <Typography variant="bodyXsRegular">{description}</Typography>
      </Stack>
    </Alert>
  )
}

export const BorrowPositionDetails = ({
  liquidationAlert,
  health,
  liquidationRange,
  bandRange,
  leverage,
  collateralValue,
  totalDebt,
}: BorrowPositionDetailsProps) => (
  <Stack padding={Spacing.md} gap={Spacing.xs}>
    {liquidationAlert.status &&
      liquidationAlert.status !== 'healthy' &&
      liquidationAlert.status !== 'closeToLiquidation' && (
        <LiquidationAlert
          type={liquidationAlert.status}
          collateralSymbol={collateralValue.collateral.symbol}
          borrowSymbol={collateralValue.borrow.symbol}
        />
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
