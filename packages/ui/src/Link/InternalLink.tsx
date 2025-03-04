import type { AnchorHTMLAttributes } from 'react'
import type { LinkProps } from './styles'
import { linkStyles } from './styles'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export interface InternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

const InternalLink = ({ children, href, ...props }: InternalLinkProps) => (
  <StyledLink {...props} to={href ?? ''}>
    {children}
  </StyledLink>
)

const StyledLink = styled(Link)`
  ${linkStyles}
`

export default InternalLink
