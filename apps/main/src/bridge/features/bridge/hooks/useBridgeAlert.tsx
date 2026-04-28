import { ReactNode, useMemo } from 'react'
import { AlertType } from '@ui/AlertBox/types'

export type BridgeAlert = {
  alertType: AlertType
  isBridgeDisabled?: boolean // disallow user from bridging
  message?: ReactNode
}

type Alerts = { [chainId: number]: BridgeAlert }

const BRIDGE_ALERTS: Alerts = {}

export const useBridgeAlert = <ChainId extends number>(rChainId: ChainId) =>
  useMemo(() => BRIDGE_ALERTS[rChainId], [rChainId])
