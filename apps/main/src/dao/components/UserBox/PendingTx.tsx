import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Spinner } from '@ui/Spinner'

type Props = {
  pendingMessage: string
  className?: string
}

export const PendingTx = ({ pendingMessage, className }: Props) => (
  <Wrapper className={className}>
    <Box flex flexGap="var(--spacing-2)" flexAlignItems="center" flexJustifyContent="center">
      <PendingMessage>{pendingMessage}</PendingMessage>
      <StyledPendingSpinner isDisabled size={16} />
    </Box>
  </Wrapper>
)

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--page--background-color);
  padding: var(--spacing-2);
`

const PendingMessage = styled.p`
  font-weight: var(--bold);
`

const StyledPendingSpinner = styled(Spinner)`
  > div {
    border-color: var(--page--text-color) transparent transparent transparent;
  }
`
