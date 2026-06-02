import { ButtonHTMLAttributes } from 'react'

export type Size = 'x-small' | 'small' | 'medium' | 'large' | 'x-large'

export type IconButtonProps = {
  hidden?: boolean
  opacity?: number
  padding?: number
  size?: Size
} & ButtonHTMLAttributes<HTMLButtonElement>
