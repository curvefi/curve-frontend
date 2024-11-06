import { styled } from '@mui/material/styles'
import { SxProps, Theme } from '@mui/system'
import { forwardRef } from 'react'
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps, To } from 'react-router-dom'

export type Href = To;

const StyledRouterLink = styled(ReactRouterLink)``

export interface RouterLinkProps extends Omit<ReactRouterLinkProps, 'to'> {
  href: Href;
  sx?: SxProps<Theme>;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => {
  const { href, ...other } = props
  return <StyledRouterLink ref={ref} to={href} {...other} role={undefined} />
})
RouterLink.displayName = 'RouterLink'
