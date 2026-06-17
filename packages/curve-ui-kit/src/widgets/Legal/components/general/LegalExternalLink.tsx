import type { ReactNode } from 'react'
import Link from '@mui/material/Link'
import { getExternalLink, type ExternalLinkKey } from '@ui/utils/utilsConstants'

type LegalExternalLinkProps = {
  link: ExternalLinkKey
  children?: ReactNode
}

/** Legal-page external link that accepts an EXTERNAL_LINKS key and defaults its label to the URL. */
export const LegalExternalLink = ({ link, children }: LegalExternalLinkProps) => {
  const href = getExternalLink(link)
  return (
    <Link color="textSecondary" href={href} target="_blank" rel="noreferrer">
      {children || href}
    </Link>
  )
}
