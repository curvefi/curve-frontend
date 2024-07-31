import TokenComboBox from '@/components/ComboBoxSelectToken'
import Button from '@/ui/Button'
import styled from 'styled-components'

export const FlexItemToken = styled.div`
  flex: 0 0 auto;
  width: 120px;
  height: var(--height-x-large);
`

export const FlexItemDistributor = styled.div`
  flex: 1;
`

export const SubTitle = styled.h3`
  font-size: var(--font-size-2);
`

export const StyledButton = styled(Button)`
  width: 100%;
  height: var(--height-medium);
  max-width: 100%;
  box-sizing: border-box;
`

export const StyledTokenComboBox = styled(TokenComboBox)`
  height: var(--height-medium);
`

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`
