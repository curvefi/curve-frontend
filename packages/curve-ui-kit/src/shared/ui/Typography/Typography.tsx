import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material'

export interface TypographyProps extends MuiTypographyProps {}

export const Typography = ({ ...props }: TypographyProps) => {
  return <MuiTypography {...props} />
}
