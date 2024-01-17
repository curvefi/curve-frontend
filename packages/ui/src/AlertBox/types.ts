import { BoxProps } from 'ui/src/Box/types'

export type AlertType = 'info' | 'warning' | 'error' | 'danger' | ''

export interface AlertBoxProps extends BoxProps {
  alertType: AlertType
  className?: string
  title?: string
  limitHeight?: boolean
  handleBtnClose?: () => void
}
