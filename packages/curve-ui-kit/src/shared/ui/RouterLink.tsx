import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Link as TanstackLink, type LinkProps as TanstackLinkProps } from '@tanstack/react-router'

type RouterLinkProps = MuiLinkProps & Pick<TanstackLinkProps, 'search'>

export const RouterLink = ({ href, search, ...props }: RouterLinkProps) => (
  <MuiLink component={TanstackLink} to={href} search={search} {...props} />
)
