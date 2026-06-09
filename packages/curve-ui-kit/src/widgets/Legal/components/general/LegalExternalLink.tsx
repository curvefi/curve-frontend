import type { ReactNode } from 'react'
import Link from '@mui/material/Link'

type LegalExternalLinkProps = {
  href: string
  children: ReactNode
}

export const LegalExternalLink = ({ href, children }: LegalExternalLinkProps) => (
  <Link color="textSecondary" href={href} target="_blank" rel="noreferrer">
    {children}
  </Link>
)
