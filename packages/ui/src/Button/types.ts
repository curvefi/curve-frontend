export type Size = 'small' | 'medium' | 'large' | 'x-large'

export type ButtonVariant = 'filled' | 'outlined' | 'icon-outlined' | 'text' | 'icon-filled' | 'select'

export type ButtonProps = {
  fillWidth?: boolean
  loading?: boolean
  nowrap?: boolean
  size?: Size
  testId?: string
  variant?: ButtonVariant
}
