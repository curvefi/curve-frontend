import Link from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'
import { ArrowTopRightIcon } from '../icons/ArrowTopRightIcon'

/**
 * InlineLink component is a link that is displayed inline with text.
/**
 * InlineLink component is a link that is displayed inline with text.
 * Tanstack Link manages both internal and external links
 */
 */
export const InlineLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
export const InlineLink = ({ to, children }: { to?: string; children: React.ReactNode }) => {
  const isExternal = to?.startsWith('http')
  return (
    <Link
      sx={{ color: 'currentColor', '&:hover': { textDecoration: 'none' } }}
      href={href}
      {...(isExternal
        ? { target: '_blank', rel: 'noreferrer noopener' }
        : { component: TanstackLink })}
    >
      {children}
      {isExternal && <ArrowTopRightIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />}
    </Link>
  )
}
