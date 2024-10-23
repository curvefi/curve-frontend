import type { AnchorHTMLAttributes } from 'react'
import type { LinkProps } from './styles'

import { Link } from 'react-router-dom'
import styled from 'styled-components'
import React from 'react'

import { linkStyles } from './styles'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

const InternalLink = ({ children, href, ...props }: React.PropsWithChildren<Props>) => (
  <StyledLink {...props} to={href ?? ''}>
    {children}
  </StyledLink>
)

const StyledLink = styled(Link)`
  ${linkStyles}
`

export default InternalLink
