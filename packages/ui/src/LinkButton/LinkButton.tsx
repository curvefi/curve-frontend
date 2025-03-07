import type { ButtonProps } from 'ui/src/Button/types'
import styled from 'styled-components'
import { buttonBaseStyles } from 'ui/src/Button/styles'
import RouterLink from 'next/link'

type RouterLinkProps = Parameters<typeof RouterLink>[0]

interface Props extends ButtonProps, RouterLinkProps {}

const LinkButton = ({ children, ...rest }: Props) => <StyledLink {...rest}>{children}</StyledLink>

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

export default LinkButton
