import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'

export interface ButtonProps extends MuiButtonProps {
  label: string
}

export const Button = ({ label, ...props }: ButtonProps) => {
  return <MuiButton {...props}>{label}</MuiButton>
}
