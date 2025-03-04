import { ButtonHTMLAttributes } from 'react'

export type Size = 'x-small' | 'small' | 'medium' | 'large' | 'x-large'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hidden?: boolean
  opacity?: number
  padding?: number
  size?: Size
}
