import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'

/**
 * MUI Link rendered as a TanStack Router Link. Accepts `href` instead of `to`.
 * Scroll is preserved when navigating to a query-string-only URL (starting with `?`).
 */
export const RouterLink = ({ href, ...props }: MuiLinkProps) => (
  <MuiLink component={TanstackLink} to={href} resetScroll={!href?.startsWith('?')} {...props} />
)
