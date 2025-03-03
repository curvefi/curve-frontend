import type { AnchorHTMLAttributes, PropsWithChildren } from 'react'
import type { LinkProps } from 'ui/src/Link/styles'
import { linkStyles } from 'ui/src/Link/styles'
import styled from 'styled-components'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {
  isNumber?: boolean
}

function ExternalLink({ className, children, ...props }: PropsWithChildren<ExternalLinkProps>) {
  return (
    <StyledLink target="_blank" {...props} className={className} rel="noreferrer noopener">
      {children}
    </StyledLink>
  )
}

const StyledLink = styled.a`
  ${linkStyles}
`

export default ExternalLink
