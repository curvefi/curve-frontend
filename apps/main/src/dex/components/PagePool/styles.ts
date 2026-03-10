import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { ShadowedBox } from '@ui/ShadowedBox'

type DivProps = ComponentPropsWithRef<'div'>
type ShadowedBoxComponentProps = ComponentProps<typeof ShadowedBox>

export const Wrapper: IStyledComponent<'web', ShadowedBoxComponentProps> = styled(ShadowedBox)`
  justify-content: flex-start;
  margin-top: var(--spacing-4);
  margin-bottom: calc(var(--spacing-3) + var(--footer-mobile-height));
  width: 100%;

  color: var(--box--primary--color);
  background: var(--box--primary--background);
`

export const FieldsWrapper: IStyledComponent<'web', DivProps> = styled.div`
  display: grid;
  width: 100%;

  row-gap: 0.5rem;
`
