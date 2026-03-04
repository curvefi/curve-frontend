import { ReactNode, useMemo } from 'react'
import { AlertType, ChainId } from '@/lend/types/lend.types'
import type { TooltipProps } from '@ui/Tooltip/types'
import { t } from '@ui-kit/lib/i18n'
import type { BannerProps } from '@ui-kit/shared/ui/Banner'

export type MarketAlert = TooltipProps & {
  alertType: AlertType
  isDisableBorrow?: boolean // disallow user from creating new borrow positions
  isDisableDeposit?: boolean // disallow user from supply deposit
  // banner message, related to the market situation
  banner?: Omit<BannerProps, 'children'> & { title: ReactNode }
  // action card message, related to action of user
  message?: ReactNode
}

const badDebtBannerAlert: MarketAlert = {
  alertType: 'warning',
  banner: {
    title: t`Bad debt`,
    subtitle: t`This market has bad debt, borrowing and supplying in this market is currently not recommended.`,
  },
}

type Alerts = { [chainId: number]: { [owmId: string]: MarketAlert } }

export const useMarketAlert = (rChainId: ChainId, rOwmId: string | undefined) =>
  useMemo(() => {
    if (!rChainId || !rOwmId) return null

    const alerts: Alerts = {
      1: {
        // sdola-crvusd lend market
        'one-way-market-30': {
          alertType: 'danger',
          isDisableBorrow: true,
          isDisableDeposit: true,
          message: t`This market is deprecated after a donation attack. New borrow positions and deposits are disabled.`,
        },
      },
      42161: {
        'one-way-market-7': {
          alertType: 'danger',
          isDisableDeposit: true,
          message: t`Due to small liquidity, borrowing or supplying in this market is not advisable.`,
        },
      },
      252: {
        'one-way-market-2': badDebtBannerAlert,
      },
    }

    const foundAlert = alerts[rChainId]?.[rOwmId]

    return foundAlert || null
  }, [rChainId, rOwmId])
