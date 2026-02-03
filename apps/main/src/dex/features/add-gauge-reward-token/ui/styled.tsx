import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Button } from '@ui/Button'

type DivProps = ComponentPropsWithRef<'div'>
type H3Props = ComponentPropsWithRef<'h3'>
type ButtonComponentProps = ComponentProps<typeof Button>

export const FlexItemToken: IStyledComponent<'web', DivProps> = styled.div`
  flex: 0 0 auto;
  width: 120px;
  height: var(--height-x-large);
`

export const FlexItemDistributor: IStyledComponent<'web', DivProps> = styled.div`
  flex: 1;
`

export const SubTitle: IStyledComponent<'web', H3Props> = styled.h3`
  font-size: var(--font-size-2);
`

export const StyledButton: IStyledComponent<'web', ButtonComponentProps> = styled(Button)`
  width: 100%;
  height: var(--height-medium);
  max-width: 100%;
  box-sizing: border-box;
`
