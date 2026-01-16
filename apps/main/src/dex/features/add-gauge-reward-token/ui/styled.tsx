import { styled } from 'styled-components'
import { Button } from '@ui/Button'

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
