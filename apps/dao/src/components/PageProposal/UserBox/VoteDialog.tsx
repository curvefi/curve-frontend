import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import { useState } from 'react'

import useStore from '@/store/useStore'
import { delayAction } from '@/ui/utils/helpers'

import ModalDialog from '@/ui/Dialog'
import Button from '@/ui/Button'
import UserInformation from './UserInformation'
import Box from '@/ui/Box'

type Props = {
  testId?: string
  className?: string
}

const VoteDialog = ({ testId, className }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const [vote, setVote] = useState<boolean | null>(null)

  const isMobile = useStore((state) => state.isMobile)
  const { castVote } = useStore((state) => state.daoProposals)
  const { userVeCrv } = useStore((state) => state.user)

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  return (
    <Wrapper className={className}>
      <Button variant="filled" onClick={overlayTriggerState.open}>
        Vote on Proposal
      </Button>
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
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div``

const VoteButtonsWrapper = styled(Box)`
  padding: var(--spacing-3);
  background-color: var(--blacka05);
`

const StyledButton = styled(Button)`
  margin-top: var(--spacing-1);
`

export default VoteDialog
