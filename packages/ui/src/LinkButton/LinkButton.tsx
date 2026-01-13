import { styled } from 'styled-components'
import { Link as RouterLink, LinkProps as RouterLinkProps } from '@tanstack/react-router'
import { buttonBaseStyles } from 'ui/src/Button/styles'
import type { ButtonProps } from 'ui/src/Button/types'

interface Props extends ButtonProps, Omit<RouterLinkProps, 'to'> {
  href?: string
}

export const LinkButton = ({ children, href, ...rest }: Props) => (
  <StyledLink to={href || '/'} {...rest}>
    {children}
  </StyledLink>
)

const StyledLink = styled(RouterLink)<ButtonProps>`
  ${buttonBaseStyles};

  ${({ variant }) => {
    if (variant === 'filled') {
      return `
        align-items: center;
        display: flex;
        justify-content: center;
        text-decoration: none;
      `
    }
  }}
`
