
export type InputMinHeight = 'small' | 'medium' | 'large' | 'x-large'
export type InputVariant = 'error' | 'warning' | 'small'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  globalDisabled?: boolean
  minHeight?: InputMinHeight
  variant?: 'small'
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export interface InputLabelProps {
  className?: string
  label: string
  descriptionLoading?: boolean
  description?: string
}
