import * as React from 'react'

export type Size = 'x-small' | 'small' | 'medium' | 'large' | 'x-large'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hidden?: boolean
  opacity?: number
  padding?: number
  size?: Size
}
