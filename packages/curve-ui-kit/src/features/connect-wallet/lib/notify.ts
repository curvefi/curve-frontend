import { v4 as uuid } from 'uuid'

type NotificationType = 'pending' | 'success' | 'error' | 'hint'

export type WalletNotification = {
  id: string
  message: string
  type: NotificationType
  autoDismiss?: number
}

const onNotified = new EventTarget()
const addMessageKey = 'walletNotification' as const
const removeMessageKey = 'walletNotificationDismiss' as const

export const notify = (message: string, type: NotificationType, autoDismiss?: number): { dismiss: () => void } => {
  const detail = {
    id: uuid(),
    type,
    message,
    ...(typeof autoDismiss !== 'undefined' && { autoDismiss }),
  } satisfies WalletNotification
  onNotified.dispatchEvent(new CustomEvent<WalletNotification>(addMessageKey, { detail }))
  const dismiss = () => onNotified.dispatchEvent(new CustomEvent(removeMessageKey, { detail }))
  return { dismiss }
}

export const listenWalletNotifications = (
  add: (notification: WalletNotification) => void,
  dismiss: (notification: WalletNotification) => void,
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
