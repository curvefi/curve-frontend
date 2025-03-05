import { BoxProps } from 'ui/src/Box/types'
import { ReactNode } from 'react'

export type AlertType = 'info' | 'warning' | 'error' | 'danger' | ''

export interface AlertBoxProps extends BoxProps {
  children?: ReactNode
  alertType: AlertType
  className?: string
  title?: string
  limitHeight?: boolean
  handleBtnClose?: () => void
}
