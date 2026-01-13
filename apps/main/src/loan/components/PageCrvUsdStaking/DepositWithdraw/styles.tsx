import { styled } from 'styled-components'
import { InputComp } from '@/loan/components/PageCrvUsdStaking/components/InputComp'
import { Icon } from '@ui/Icon'

export const SelectorBox = styled.div`
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

export const StyledIcon = styled(Icon)`
  margin: var(--spacing-3) auto 0;
  color: var(--white);
`

export const StyledInputComp = styled(InputComp)`
  width: 100%;
  height: 100%;
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
`

export const InputSelectorText = styled.p`
  font-weight: var(--bold);
`

export const InputLabel = styled.p`
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);
  color: var(--box--primary--color);
`

export const ErrorText = styled.p`
  font-size: var(--font-size-1);
  color: var(--chart-red);
  margin-top: var(--spacing-1);
`
