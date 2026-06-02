import type { AnchorHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import type { LinkProps } from '@ui/Link/styles'
import { linkStyles } from '@ui/Link/styles'

export type ExternalLinkProps = {
  isNumber?: boolean
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  LinkProps

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
