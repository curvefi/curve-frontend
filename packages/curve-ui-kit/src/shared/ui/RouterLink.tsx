import NextLink from 'next/link'
import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'

export const RouterLink = (props: MuiLinkProps) => <MuiLink component={NextLink} {...props} />
