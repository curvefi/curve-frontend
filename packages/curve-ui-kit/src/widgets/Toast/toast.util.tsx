import { random } from 'lodash'
import type { ReactNode } from 'react'
import type { AlertProps } from '@mui/material/Alert'

const onToast = new EventTarget()
const addMessageKey = 'curveToast' as const
const removeMessageKey = 'dismissCurveToast' as const

export type ToastItem = {
  id: string
  message?: ReactNode
  title: string
  testId?: string
  severity?: AlertProps['severity']
}

export const showToast = (item: Omit<ToastItem, 'id'>): { dismiss: () => void } => {
  const detail: ToastItem = { id: random(0, 1e16).toString(), ...item }
  onToast.dispatchEvent(new CustomEvent<ToastItem>(addMessageKey, { detail }))
  const dismiss = () => onToast.dispatchEvent(new CustomEvent(removeMessageKey, { detail }))
  return { dismiss }
}

export const watchToasts = (onAdd: (toast: ToastItem) => void, onRemove: (toast: ToastItem) => void) => {
  const addListener = (event: Event) => onAdd((event as CustomEvent).detail)
  const removeListener = (event: Event) => onRemove((event as CustomEvent).detail)
  onToast.addEventListener(addMessageKey, addListener)
  onToast.addEventListener(removeMessageKey, removeListener)
  return () => {
    onToast.removeEventListener(addMessageKey, addListener)
    onToast.removeEventListener(removeMessageKey, removeListener)
  }
}
