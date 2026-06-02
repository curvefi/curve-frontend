import { ReactNode } from 'react'
import { styled } from 'styled-components'

type Size = 'md' | 'lg'

type Props = {
  title: string
  size?: Size
  children: ReactNode
}

export const InputReadyOnly = ({ children, size = 'md', title }: Props) => (
  <Wrapper size={size}>
    <Title>{title}</Title>
    <Content>{children}</Content>
  </Wrapper>
)

const Wrapper = styled.div<{ size?: Size }>`
  display: grid;

  background: var(--whitea10);
  border: 1px solid var(--whitea30);
  box-shadow: inset 0 4px 30px var(--blacka10);

  grid-gap: 0.25rem;

  ${({ size }) => {
    if (size === 'md') {
      return `
        min-height: var(--height-x-large);
        padding: 0.25rem 0.5rem; // 4px 8px
      `
    } else if (size === 'lg') {
      return `
        padding: 0.75rem;
        min-height: 4.5625rem; // 73px
      `
    }
  }}
`

const Title = styled.div`
  font-size: var(--font-size-1); // 12px
  opacity: 0.7;
`

const Content = styled.div`
  font-size: var(--font-size-4); // 18px
  opacity: 0.7;
`
