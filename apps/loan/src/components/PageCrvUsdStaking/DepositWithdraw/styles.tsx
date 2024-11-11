import styled from 'styled-components'

import Icon from '@/ui/Icon'

import InputComp from '@/components/PageCrvUsdStaking/components/InputComp'

export const SelectorBox = styled.div`
  background-color: var(--summary_header--loading--background-color);
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 8rem;
`

export const StyledIcon = styled(Icon)`
  margin: var(--spacing-3) auto 0;
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
`

export const ErrorText = styled.p`
  font-size: var(--font-size-1);
  color: var(--chart-red);
  margin-top: var(--spacing-1);
`
