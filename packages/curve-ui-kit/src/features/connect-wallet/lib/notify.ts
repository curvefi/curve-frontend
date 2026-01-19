import { random } from 'lodash'
import type { ReactNode } from 'react'
import type { AlertProps } from '@mui/material/Alert'
import { t } from '@ui-kit/lib/i18n'
import type { MakeOptional } from '@ui-kit/types/util'

export type ToastNotification = {
  id: string
  message: ReactNode
  title?: string
  testId?: string
  severity?: AlertProps['severity']
}

const onNotified = new EventTarget()
const addMessageKey = 'curveNotification' as const
const removeMessageKey = 'dismissCurveNotification' as const

export const showToast = (notification: MakeOptional<ToastNotification, 'id'>): { dismiss: () => void } => {
  const detail: ToastNotification = { id: random(0, 1e16).toString(), ...notification }
  onNotified.dispatchEvent(new CustomEvent<ToastNotification>(addMessageKey, { detail }))
  const dismiss = () => onNotified.dispatchEvent(new CustomEvent(removeMessageKey, { detail }))
  return { dismiss }
}

export const notify = (message: string, type: 'pending' | 'success' | 'error' | 'hint'): { dismiss: () => void } =>
  showToast({
    severity: ({ hint: 'info', error: 'error', pending: 'info', success: 'success' } as const)[type],
    title: { hint: t`Hint`, error: t`Error`, pending: t`Pending`, success: t`Success` }[type],
    message,
  })

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
