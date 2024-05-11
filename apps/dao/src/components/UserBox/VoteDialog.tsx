import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import { useState, useMemo } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { delayAction } from '@/ui/utils/helpers'

import ModalDialog from '@/ui/Dialog'
import Button from '@/ui/Button'
import UserInformation from './UserInformation'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'

type Props = {
  active: boolean
  testId?: string
  votingPower: SnapshotVotingPower
  snapshotVotingPower: boolean
  className?: string
}

const VoteDialog = ({ active, testId, className, votingPower, snapshotVotingPower }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const [vote, setVote] = useState<boolean | null>(null)

  const isMobile = useStore((state) => state.isMobile)
  const { castVote } = useStore((state) => state.proposals)

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
        votingPower.value === 0 ? (
          <VotingMessage>
            <Icon name="WarningSquareFilled" size={20} />
            {t`Voting power too low to participate in this proposal.`}
          </VotingMessage>
        ) : (
          <>
            <VoteDialogButton variant="filled" onClick={overlayTriggerState.open}>
              {t`Vote on Proposal`}
            </VoteDialogButton>
            {overlayTriggerState.isOpen && (
              <ModalDialog testId={testId} title={''} state={{ ...overlayTriggerState, close: handleClose }}>
                <Box flex>
                  <UserInformation snapshotVotingPower={snapshotVotingPower} votingPower={votingPower} noLink />
                </Box>
                <VoteButtonsWrapper
                  flex
                  flexGap="var(--spacing-2)"
                  margin="var(--spacing-4) 0 var(--spacing-3)"
                  flexJustifyContent="center"
                >
                  <Button variant="select" className={vote === true ? 'active' : ''} onClick={() => setVote(true)}>
                    {t`For`}
                  </Button>
                  <Button variant="select" className={vote === false ? 'active' : ''} onClick={() => setVote(false)}>
                    {t`Against`}
                  </Button>
                </VoteButtonsWrapper>
                <StyledButton
                  fillWidth
                  variant="icon-filled"
                  disabled={vote === null}
                  onClick={() => castVote(1, 'PARAMETER', vote!)}
                >
                  {t`Cast Vote`}
                </StyledButton>
              </ModalDialog>
            )}{' '}
          </>
        )
      ) : (
        <VotingMessage>{t`Voting has ended`}</VotingMessage>
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

const VotingMessage = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  color: var(--button_outlined--color);
  font-weight: var(--semi-bold);
  font-size: var(--font-size-1);
  line-height: 1.2;
  margin-right: auto;
  /* border: 1px solid var(--gray-500a25); */
  background-color: var(--gray-500a25);
  svg {
    color: var(--warning-400);
  }
`

const VoteDialogButton = styled(Button)`
  margin-right: auto;
`

const StyledButton = styled(Button)`
  margin-top: var(--spacing-1);
`

export default VoteDialog
