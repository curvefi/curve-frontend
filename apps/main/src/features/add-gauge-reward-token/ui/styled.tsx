import Box from '@/ui/Box'
import Button from '@/ui/Button'
import styled from 'styled-components'
import TokenComboBox from '@/components/ComboBoxSelectToken'

export const StyledBox = styled(Box)`
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-4);
`

export const FlexContainer = styled.div`
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`

export const FlexItemToken = styled.div`
  flex: 0 0 auto;
  width: 120px;
  height: var(--height-x-large);
`

export const FlexItemDistributor = styled.div`
  flex: 1;
`

export const Title = styled.h2`
  font-size: var(--font-size-4);
  margin-bottom: var(--spacing-3);
`

export const SubTitle = styled.h3`
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-2);
`

export const StyledButton = styled(Button)`
  width: 100%;
  height: var(--height-medium);
  margin-top: var(--spacing-3);
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
  margin-bottom: var(--spacing-3);
`
