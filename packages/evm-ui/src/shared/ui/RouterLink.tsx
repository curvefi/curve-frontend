import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import type { ParsedHistoryState } from '@tanstack/history'
import { Link as TanstackLink } from '@tanstack/react-router'

export type RouterState = {
  /** The default tab to pass as a route state when navigating to this action. **/
  defaultTab?: string | number
}

type RouterLinkProps = MuiLinkProps & {
  /** The default tab to pass as a route state when navigating to this action. **/
  state?: RouterState
}

/**
 * MUI Link rendered as a TanStack Router Link. Accepts `href` instead of `to`.
 * Scroll is preserved when navigating to a query-string-only URL (starting with `?`).
 * Hash-only links replace the current history entry.
 */
export const RouterLink = ({ href, state, ...props }: RouterLinkProps) => (
  <MuiLink
    component={TanstackLink}
    to={href}
    replace={href?.startsWith('#')}
    resetScroll={!href?.startsWith('?')}
    state={state && ((previousState: ParsedHistoryState) => ({ ...previousState, ...state }))}
    {...props}
  />
)
