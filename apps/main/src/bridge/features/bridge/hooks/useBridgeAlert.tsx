import { ReactNode, useMemo } from 'react'
import { AlertType } from '@legacy-ui/AlertBox/types'

export type BridgeAlert = {
  alertType: AlertType
  isBridgeDisabled?: boolean // disallow user from bridging
  message?: ReactNode
}

type Alerts = Record<number, BridgeAlert>

const BRIDGE_ALERTS: Alerts = {}

export const useBridgeAlert = <ChainId extends number>(chainId: ChainId) =>
  useMemo(() => BRIDGE_ALERTS[chainId], [chainId])
