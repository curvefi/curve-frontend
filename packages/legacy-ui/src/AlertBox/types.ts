import { ReactNode } from 'react'
import { BoxProps } from '@ui/Box/types'

export type AlertType = 'info' | 'warning' | 'error' | 'danger' | ''

export type AlertBoxProps = {
  children?: ReactNode
  alertType: AlertType
  className?: string
  title?: string
  limitHeight?: boolean
  handleBtnClose?: () => void
} & BoxProps
