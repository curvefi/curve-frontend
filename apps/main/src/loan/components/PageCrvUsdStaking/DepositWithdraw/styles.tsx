import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { InputComp } from '@/loan/components/PageCrvUsdStaking/components/InputComp'
import { Icon } from '@ui/Icon'

type DivProps = ComponentPropsWithRef<'div'>
type PProps = ComponentPropsWithRef<'p'>
type IconComponentProps = ComponentProps<typeof Icon>
type InputCompComponentProps = ComponentProps<typeof InputComp>

export const SelectorBox: IStyledComponent<'web', DivProps> = styled.div`
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 8rem;
  background-color: var(--input--background-color);
  box-sizing: border-box;
  border: 1px solid var(--input--border-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--input--border-color);
`

export const StyledIcon: IStyledComponent<'web', IconComponentProps> = styled(Icon)`
  margin: var(--spacing-3) auto 0;
  color: var(--white);
`

export const StyledInputComp: IStyledComponent<'web', InputCompComponentProps> = styled(InputComp)`
  width: 100%;
  height: 100%;
`

export const InputWrapper: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
`

export const InputSelectorText: IStyledComponent<'web', PProps> = styled.p`
  font-weight: var(--bold);
`

export const InputLabel: IStyledComponent<'web', PProps> = styled.p`
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);
  color: var(--box--primary--color);
`

export const ErrorText: IStyledComponent<'web', PProps> = styled.p`
  font-size: var(--font-size-1);
  color: var(--chart-red);
  margin-top: var(--spacing-1);
`
