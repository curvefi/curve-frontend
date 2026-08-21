import { random } from 'lodash'
import type { ReactNode } from 'react'
import type { AlertProps } from '@mui/material/Alert'

const onToast = new EventTarget()
const ADD_MESSAGE_KEY = 'curveToast' as const
const REMOVE_MESSAGE_KEY = 'dismissCurveToast' as const

export type ToastItem = {
  id: string
  message?: ReactNode
  title: string
  testId?: string
  severity?: AlertProps['severity']
  keepAlive?: boolean
}

export const showToast = (item: Omit<ToastItem, 'id'>): { dismiss: () => void } => {
  const detail: ToastItem = { id: random(0, 1e16).toString(), ...item }
  onToast.dispatchEvent(new CustomEvent<ToastItem>(ADD_MESSAGE_KEY, { detail }))
  const dismiss = () => onToast.dispatchEvent(new CustomEvent(REMOVE_MESSAGE_KEY, { detail }))
  return { dismiss }
}

export const watchToasts = (onAdd: (toast: ToastItem) => void, onRemove: (toast: ToastItem) => void) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
  const addListener = (event: Event) => onAdd((event as CustomEvent).detail)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
  const removeListener = (event: Event) => onRemove((event as CustomEvent).detail)
  onToast.addEventListener(ADD_MESSAGE_KEY, addListener)
  onToast.addEventListener(REMOVE_MESSAGE_KEY, removeListener)
  return () => {
    onToast.removeEventListener(ADD_MESSAGE_KEY, addListener)
    onToast.removeEventListener(REMOVE_MESSAGE_KEY, removeListener)
  }
}
