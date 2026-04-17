import { ReactNode } from 'react'
import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { t, Trans } from '@ui-kit/lib/i18n'
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

const getAlerts = (
  collateralSymbol: string | undefined,
  borrowSymbol: string | undefined,
): Record<
  Exclude<UserPositionStatus, 'healthy' | 'closeToLiquidation'>,
  { title: string; description: ReactNode; severity: 'warning' | 'error' }
> => ({
  softLiquidation: {
    title: t`Liquidation protection active`,
    description: (
      <Trans>
        The collateral price is inside your liquidation range. Within the range, collateral is being converted between{' '}
        {collateralSymbol} and {borrowSymbol} as the price goes up or down. These conversions incur losses that reduce
        the position's health.
        <br />
        You cannot add collateral while in the range. Close your position to recover current collateral. You can also
        monitor health closely and repay debt to keep the position open.
        <br />
        If health reaches 0, your position is hard-liquidated.
      </Trans>
    ),
    severity: 'warning',
  },
  hardLiquidation: {
    title: t`Position can be hard-liquidated`,
    description: (
      <Trans>
        Health has reached 0. Your position can be liquidated at any time — all collateral will be lost. <br />
        Repay debt and close immediately to recover remaining collateral.
      </Trans>
    ),
    severity: 'error',
  },
  fullyConverted: {
    title: t`Fully converted to ${borrowSymbol}`,
    description: (
      <Trans>
        Liquidation protection has fully converted your {collateralSymbol} into {borrowSymbol}. No losses occur while
        price stays below the range.
        <br />
        <br />
        If price recovers into your range, conversions resume and losses will further reduce your health. Consider
        closing your position or repaying debt to improve health before that happens.
      </Trans>
    ),
    severity: 'warning',
  },
  incompleteConversion: {
    title: t`Position at risk — incomplete conversion`,
    description: (
      <Trans>
        Price is below your liquidation range but your {collateralSymbol} was not fully converted. Your position is
        likely undercollateralized. <br />
        If price recovers, accumulated conversion losses will likely result in hard liquidation.
      </Trans>
    ),
    severity: 'error',
  },
})

const LiquidationAlert = ({
  type,
  collateralSymbol,
  borrowSymbol,
}: {
  type: Exclude<UserPositionStatus, 'healthy' | 'closeToLiquidation'>
  collateralSymbol: string | undefined
  borrowSymbol: string | undefined
}) => {
  const alerts = getAlerts(collateralSymbol, borrowSymbol)
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
