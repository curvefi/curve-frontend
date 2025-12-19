import Link from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'
import { ArrowTopRightIcon } from '../icons/ArrowTopRightIcon'

/**
 * InlineLink component is a link that is displayed inline with text.
 * Using either Tanstack Link for internal links or MUI Link for external links (with arrow icon).
 */
export const InlineLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const isExternal = href.startsWith('http')
  return (
    <Link
      component={isExternal ? Link : TanstackLink}
      sx={{ color: 'currentColor', '&:hover': { textDecoration: 'none' } }}
      href={href}
      {...(isExternal && { target: '_blank', rel: 'noreferrer noopener' })}
    >
      {children}
      {isExternal && <ArrowTopRightIcon fontSize={'small'} sx={{ verticalAlign: 'bottom' }} />}
    </Link>
  )
}
