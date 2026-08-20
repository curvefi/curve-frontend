import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'

/**
 * MUI Link rendered as a TanStack Router Link. Accepts `href` instead of `to`.
 * Scroll is preserved when navigating to a query-string-only URL (starting with `?`).
 * Hash-only links stay native so in-page anchors do not trigger app route navigation.
 */
export const RouterLink = ({ href, ...props }: MuiLinkProps) =>
  href?.startsWith('#') ? (
    <MuiLink href={href} {...props} />
  ) : (
    <MuiLink component={TanstackLink} to={href} resetScroll={!href?.startsWith('?')} {...props} />
  )
