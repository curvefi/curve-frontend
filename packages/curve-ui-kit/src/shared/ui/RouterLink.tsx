import { Link as ReactRouterLink } from 'react-router'
import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'

export const RouterLink = ({ href, ...props }: MuiLinkProps) => (
  <MuiLink component={ReactRouterLink} to={href} {...props} />
)
