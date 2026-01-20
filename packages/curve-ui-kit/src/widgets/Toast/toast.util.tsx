import { random } from 'lodash'
import type { ReactNode } from 'react'
import type { AlertProps } from '@mui/material/Alert'
import type { MakeOptional } from '@ui-kit/types/util'

const onNotified = new EventTarget()
const addMessageKey = 'curveNotification' as const
const removeMessageKey = 'dismissCurveNotification' as const

export type ToastNotification = {
  id: string
  message: ReactNode
  title?: string
  testId?: string
  severity?: AlertProps['severity']
}

export const showToast = (notification: MakeOptional<ToastNotification, 'id'>): { dismiss: () => void } => {
  const detail: ToastNotification = { id: random(0, 1e16).toString(), ...notification }
  onNotified.dispatchEvent(new CustomEvent<ToastNotification>(addMessageKey, { detail }))
  const dismiss = () => onNotified.dispatchEvent(new CustomEvent(removeMessageKey, { detail }))
  return { dismiss }
}

export const listenWalletNotifications = (
  add: (notification: ToastNotification) => void,
  dismiss: (notification: ToastNotification) => void,
) => {
  const addListener = (event: Event) => add((event as CustomEvent).detail)
  onNotified.addEventListener(addMessageKey, addListener)
  const removeListener = (event: Event) => dismiss((event as CustomEvent).detail)
  onNotified.addEventListener(removeMessageKey, removeListener)
  return () => {
    onNotified.removeEventListener(addMessageKey, addListener)
    onNotified.removeEventListener(removeMessageKey, removeListener)
  }
}
