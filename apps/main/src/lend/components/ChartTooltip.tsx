import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { breakpoints } from '@ui/utils/responsive'

export const ChartTooltip = ({ children }: { children: ReactNode }) => (
  <Wrapper grid gridRowGap={2}>
    {children}
  </Wrapper>
)

export const Wrapper = styled(Box)`
  background-color: var(--tooltip--background-color);
  color: var(--tooltip--color);
  font-size: var(--font-size-2);
  outline: none;
  padding: 1rem 1.25rem;
`

export const TipTitle = styled.div`
  font-weight: bold;
  margin-bottom: 2px;
`

export const TipContent = styled(Box)`
  align-items: center;
  display: grid;
  justify-content: flex-start;

  @media (min-width: ${breakpoints.sm}rem) {
    display: flex;
  }
`

export const TipIcon = styled(Icon)`
  position: relative;
  left: -2px;
`
