import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import type { HistoryState, ParsedHistoryState } from '@tanstack/history'
import { Link as TanstackLink } from '@tanstack/react-router'

declare module '@tanstack/history' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HistoryState {
    defaultTab?: string | number
  }
}

type RouterLinkProps = MuiLinkProps & {
  state?: HistoryState
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
