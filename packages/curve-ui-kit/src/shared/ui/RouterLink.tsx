import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'

export const RouterLink = ({ href, ...props }: MuiLinkProps) => (
  <MuiLink component={TanstackLink} to={href} {...props} />
)
