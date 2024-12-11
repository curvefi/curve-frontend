import Button from '@mui/material/Button'
import { ReactNode } from 'react'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
}

export const Link = ({ label, href, icon, target = '_blank' }: LinkProps) => (
  <Button component="a" href={href} target={target} rel="noreferrer" color="ghost" variant="link" startIcon={icon}>
    {label}
  </Button>
)
