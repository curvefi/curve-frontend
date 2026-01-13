import type { AnchorHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import type { LinkProps } from 'ui/src/Link/styles'
import { linkStyles } from 'ui/src/Link/styles'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {
  isNumber?: boolean
}

export function ExternalLink({ className, children, ...props }: ExternalLinkProps) {
  return (
    <StyledLink target="_blank" {...props} className={className} rel="noreferrer noopener">
      {children}
    </StyledLink>
  )
}

const StyledLink = styled.a`
  ${linkStyles}
`
