import { InputHTMLAttributes } from 'react'

export type InputMinHeight = 'small' | 'medium' | 'large' | 'x-large'
export type InputVariant = 'error' | 'warning' | 'small'

export type InputProps = {
  id: string
  globalDisabled?: boolean
  minHeight?: InputMinHeight
  variant?: 'small'
  inputProps?: InputHTMLAttributes<HTMLInputElement>
} & InputHTMLAttributes<HTMLInputElement>

export type InputLabelProps = {
  className?: string
  label: string
  descriptionLoading?: boolean
  description?: string
}
