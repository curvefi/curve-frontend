import { InputHTMLAttributes } from 'react'

export type InputMinHeight = 'small' | 'medium' | 'large' | 'x-large'
export type InputVariant = 'error' | 'warning' | 'small'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  globalDisabled?: boolean
  minHeight?: InputMinHeight
  variant?: 'small'
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export interface InputLabelProps {
  className?: string
  label: string
  descriptionLoading?: boolean
  description?: string
}
