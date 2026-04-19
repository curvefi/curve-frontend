import { ReactNode, useMemo } from 'react'
import { AlertType } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'
import { Chain } from '@ui-kit/utils'

export type BridgeAlert = {
  alertType: AlertType
  isDisableBridge?: boolean // disallow user from bridging
  message?: ReactNode
}

type Alerts = { [chainId: number]: BridgeAlert }

const RSETH_ALERT: BridgeAlert = {
  alertType: 'danger',
  isDisableBridge: true,
  message: t`FastBridge is temporarily paused as a precaution pending further clarity from a recent third-party incident`,
}

const BRIDGE_ALERTS: Alerts = {
  [Chain.Arbitrum]: RSETH_ALERT,
  [Chain.Optimism]: RSETH_ALERT,
  [Chain.Fraxtal]: RSETH_ALERT,
}

export const useBridgeAlert = <ChainId extends number>(rChainId: ChainId) =>
  useMemo(() => BRIDGE_ALERTS[rChainId], [rChainId])
