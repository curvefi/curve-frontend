import type { ComponentProps, ComponentPropsWithRef, ReactNode } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import type { IconProps } from '@ui/Icon/Icon'
import { breakpoints } from '@ui/utils/responsive'

export const ChartTooltip = ({ children }: { children: ReactNode }) => (
  <Wrapper grid gridRowGap={2}>
    {children}
  </Wrapper>
)

type DivProps = ComponentPropsWithRef<'div'>
type BoxComponentProps = ComponentProps<typeof Box>

export const Wrapper: IStyledComponent<'web', BoxComponentProps> = styled(Box)`
  background-color: var(--tooltip--background-color);
  color: var(--tooltip--color);
  font-size: var(--font-size-2);
  outline: none;
  padding: 1rem 1.25rem;
`

export const TipTitle: IStyledComponent<'web', DivProps> = styled.div`
  font-weight: bold;
  margin-bottom: 2px;
`

export const TipContent: IStyledComponent<'web', BoxComponentProps> = styled(Box)`
  align-items: center;
  display: grid;
  justify-content: flex-start;

  @media (min-width: ${breakpoints.sm}rem) {
    display: flex;
  }
`

export const TipIcon: IStyledComponent<'web', IconProps> = styled(Icon)`
  position: relative;
  left: -2px;
`
