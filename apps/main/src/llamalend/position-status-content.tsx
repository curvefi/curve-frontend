import type { ReactNode } from 'react'
import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import { t, Trans } from '@ui-kit/lib/i18n'

export type PositionStatusContent = {
  title: string
  description: ReactNode
  severity: 'info' | 'warning' | 'error'
  /** Shows an alert box above health bar */
  hasMarketAlert: boolean
}

export const getPositionStatusContent = (
  collateralSymbol: string | undefined,
  borrowSymbol: string | undefined,
): Record<UserPositionStatus, PositionStatusContent> => ({
  healthy: {
    title: t`Position is healthy`,
    description: (
      <Trans>The oracle price is above your liquidation range. No soft-liquidation conversions are occurring.</Trans>
    ),
    severity: 'info',
    hasMarketAlert: false,
  },
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
        If health reaches 0, your position can be hard-liquidated.
      </Trans>
    ),
    severity: 'warning',
    hasMarketAlert: true,
  },
  hardLiquidation: {
    title: t`Position can be hard-liquidated`,
    description: (
      <Trans>
        Health has reached 0. Your position can be liquidated at any time - all collateral will be lost. <br />
        Repay debt and close immediately to recover remaining collateral.
      </Trans>
    ),
    severity: 'error',
    hasMarketAlert: true,
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
    hasMarketAlert: true,
  },
  incompleteConversion: {
    title: t`Position at risk - incomplete conversion`,
    description: (
      <Trans>
        Price is below your liquidation range but your {collateralSymbol} was not fully converted. Your position is
        likely undercollateralized. <br />
        If price recovers, accumulated conversion losses will likely result in hard liquidation.
      </Trans>
    ),
    severity: 'error',
    hasMarketAlert: true,
  },
})
