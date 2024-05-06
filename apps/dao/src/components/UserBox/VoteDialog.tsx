import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import { useState, useMemo } from 'react'

import useStore from '@/store/useStore'
import { delayAction } from '@/ui/utils/helpers'

import ModalDialog from '@/ui/Dialog'
import Button from '@/ui/Button'
import UserInformation from './UserInformation'
import Box from '@/ui/Box'

type Props = {
  active: boolean
  testId?: string
  className?: string
}

const VoteDialog = ({ active, testId, className }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const [vote, setVote] = useState<boolean | null>(null)

  const isMobile = useStore((state) => state.isMobile)
  const { castVote } = useStore((state) => state.daoProposals)

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  return (
    <Wrapper className={className}>
      {active ? (
        <>
          <VoteDialogButton variant="filled" onClick={overlayTriggerState.open}>
            Vote on Proposal
          </VoteDialogButton>
          {overlayTriggerState.isOpen && (
            <ModalDialog testId={testId} title={''} state={{ ...overlayTriggerState, close: handleClose }}>
              <Box flex>
                <UserInformation noLink />
              </Box>
              <VoteButtonsWrapper
                flex
                flexGap="var(--spacing-2)"
                margin="var(--spacing-4) 0 var(--spacing-3)"
                flexJustifyContent="center"
              >
                <Button variant="select" className={vote === true ? 'active' : ''} onClick={() => setVote(true)}>
                  For
                </Button>
                <Button variant="select" className={vote === false ? 'active' : ''} onClick={() => setVote(false)}>
                  Against
                </Button>
              </VoteButtonsWrapper>
              <StyledButton
                fillWidth
                variant="icon-filled"
                disabled={vote === null}
                onClick={() => castVote(1, 'PARAMETER', vote!)}
              >
                Cast Vote
              </StyledButton>
            </ModalDialog>
          )}{' '}
        </>
      ) : (
        <EndedMessage>Voting has ended</EndedMessage>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const VoteButtonsWrapper = styled(Box)`
  padding: var(--spacing-3);
  background-color: var(--blacka05);
`

const EndedMessage = styled.p`
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--button_outlined--color);
  font-weight: var(--button--font-weight);
  line-height: 1.2;
  margin-right: auto;
  border: 1px solid var(--button_outlined--border-color);
`

const VoteDialogButton = styled(Button)`
  margin-right: auto;
`

const StyledButton = styled(Button)`
  margin-top: var(--spacing-1);
`

export default VoteDialog
