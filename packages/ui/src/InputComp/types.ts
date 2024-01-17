import * as React from 'react'

export type InputMinHeight = 'small' | 'medium' | 'large' | 'x-large'
export type InputVariant = 'error' | 'warning'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  globalDisabled?: boolean
  minHeight?: InputMinHeight
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export interface InputLabelProps {
  className?: string
  label: string
  descriptionLoading?: boolean
  description?: string
}
