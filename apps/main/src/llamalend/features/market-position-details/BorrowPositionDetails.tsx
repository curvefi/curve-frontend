import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces

export type LiquidationAlert = {
  softLiquidation: boolean
  hardLiquidation: boolean
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

const alerts = {
  soft: {
    title: t`Soft-liquidation active`,
    description: t`Your position is inside the liquidation range and is being rebalanced by LLAMMA. This can reduce collateral over time. Repay debt or close the position to lower risk. If health falls below 0, the position becomes eligible for hard liquidation.`,
    severity: 'warning',
  },
  hard: {
    title: t`Liquidation protection disabled`,
    description: t`Health has reached 0 and your position can now be liquidated at any time and all collateral lost. To recover remaining collateral (minus fees), repay your debt and withdraw promptly.`,
    severity: 'error',
  },
} as const

const LiquidationAlert = ({ type }: { type: 'soft' | 'hard' }) => {
  const { title, description, severity } = alerts[type]

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
    {liquidationAlert.softLiquidation && <LiquidationAlert type="soft" />}
    {liquidationAlert.hardLiquidation && <LiquidationAlert type="hard" />}
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
