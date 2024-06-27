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
import AlertBox from '@/ui/AlertBox'
import ModalPendingTx from '@/ui/ModalPendingTx'

type Props = {
  activeProposal?: ActiveProposal
  testId?: string
  proposalId?: string
  votingPower: SnapshotVotingPower
  snapshotVotingPower: boolean
  className?: string
}

const VoteDialog = ({ activeProposal, testId, className, votingPower, snapshotVotingPower, proposalId }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const [vote, setVote] = useState<boolean | null>(null)

  const isMobile = useStore((state) => state.isMobile)
  const { castVote, voteTx } = useStore((state) => state.proposals)
  const { userVotesMapper } = useStore((state) => state.user)

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  return (
    <Wrapper className={className}>
      {activeProposal?.active ? (
        // Voting power too low
        votingPower.value === 0 ? (
          <VotingMessage>
            <Icon name="WarningSquareFilled" size={20} />
            {t`Voting power too low to participate in this proposal.`}
          </VotingMessage>
        ) : // Already voted
        proposalId && userVotesMapper[proposalId] ? (
          <VotedMessageWrapper>
            <VotedMessage>{t`You have succesfully voted:`}</VotedMessage>
            <VotedMessage>
              {t`${userVotesMapper[proposalId].userVote ? 'For' : 'Against'}`}
              {userVotesMapper[proposalId].userVote ? (
                <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} />
              ) : (
                <Icon color="var(--chart-red)" name="Misuse" size={16} />
              )}
            </VotedMessage>
          </VotedMessageWrapper>
        ) : (
          // Vote
          <>
            <VoteDialogButton variant="filled" onClick={overlayTriggerState.open}>
              {t`Vote on Proposal`}
            </VoteDialogButton>
            {overlayTriggerState.isOpen && (
              <ModalDialog
                noContentPadding
                testId={testId}
                title={''}
                state={{ ...overlayTriggerState, close: handleClose }}
              >
                <ModalContainer>
                  <ModalHeader
                    flex
                    flexJustifyContent="space-between"
                    flexAlignItems="center"
                    padding="var(--spacing-3)"
                  >
                    <ModalTitle>{t`Vote for proposal`}</ModalTitle>
                    <CloseButton variant="text" onClick={handleClose}>
                      <Icon name="Close" size={32} />
                    </CloseButton>
                  </ModalHeader>
                  <BlurWrapper>
                    {voteTx.status === 'LOADING' && (
                      <ModalPendingTx
                        transactionHash={voteTx.hash!}
                        txLink={voteTx.txLink!}
                        pendingMessage={t`Casting vote...`}
                      />
                    )}
                    <UserInformationContainer flex padding="var(--spacing-3)" flexJustifyContent="center">
                      <UserInformation
                        snapshotVotingPower={snapshotVotingPower}
                        votingPower={votingPower}
                        activeProposal={activeProposal}
                        noLink
                      />
                    </UserInformationContainer>
                    <VoteButtonsWrapper flex flexColumn flexGap="var(--spacing-3)" flexJustifyContent="center">
                      {voteTx.status !== 'SUCCESS' && (
                        <Box
                          flex
                          flexGap="var(--spacing-2)"
                          margin="var(--spacing-2) 0"
                          flexDirection="row"
                          flexJustifyContent="center"
                        >
                          <Button
                            variant="select-flat"
                            className={vote === true ? 'active' : ''}
                            onClick={() => setVote(true)}
                          >
                            {t`For`}
                          </Button>
                          <Button
                            variant="select-flat"
                            className={vote === false ? 'active' : ''}
                            onClick={() => setVote(false)}
                          >
                            {t`Against`}
                          </Button>
                        </Box>
                      )}
                      {voteTx.status === 'ERROR' && (
                        <StyledAlertBox alertType="error" limitHeight>
                          {voteTx.error}
                        </StyledAlertBox>
                      )}
                      {voteTx.status === 'SUCCESS' && (
                        <SuccessWrapper>{t`Proposal vote succesfully cast!`}</SuccessWrapper>
                      )}
                      {voteTx.status !== 'SUCCESS' && (
                        <VoteButton
                          variant="icon-filled"
                          disabled={vote === null}
                          onClick={() => castVote(1, 'PARAMETER', vote!)}
                          loading={voteTx.status === 'CONFIRMING' || voteTx.status === 'LOADING'}
                        >
                          {t`Cast Vote`}
                        </VoteButton>
                      )}
                    </VoteButtonsWrapper>
                  </BlurWrapper>
                </ModalContainer>
              </ModalDialog>
            )}{' '}
          </>
        )
      ) : // Voted successfully
      proposalId && userVotesMapper[proposalId] ? (
        <VotedMessageWrapper>
          <VotedMessage>{t`You have succesfully voted:`}</VotedMessage>
          <VotedMessage>
            {t`${userVotesMapper[proposalId].userVote ? 'For' : 'Against'}`}
            {userVotesMapper[proposalId].userVote ? (
              <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} />
            ) : (
              <Icon color="var(--chart-red)" name="Misuse" size={16} />
            )}
          </VotedMessage>
        </VotedMessageWrapper>
      ) : (
        // Voting ended
        <VotingMessage>{t`Voting has ended`}</VotingMessage>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: 99 !important;
  @media (max-width: 26.5625rem) {
    height: 100vh;
    max-height: 100vh;
  }
`

const ModalHeader = styled(Box)``

const ModalTitle = styled.h3``

const BlurWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
`

const CloseButton = styled(Button)`
  padding: 0;
  display: flex;
  align-self: center;
  justify-content: center;
  svg {
    color: var(--page--text-color);
    width: 32px;
    height: 32px;
  }
`

const UserInformationContainer = styled(Box)`
  @media (max-width: 26.5625rem) {
    margin: auto 0;
  }
`

const VoteButtonsWrapper = styled(Box)`
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
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
  background-color: var(--box_header--secondary--background-color);
  svg {
    color: var(--warning-400);
  }
`

const VotedMessageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
  align-items: center;
  justify-content: space-between;
  background-color: var(--box_header--secondary--background-color);
  padding: var(--spacing-2);
`

const VotedMessage = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--button_outlined--color);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  line-height: 1.5;
`

const VoteDialogButton = styled(Button)`
  margin-right: auto;
`

const VoteButton = styled(Button)`
  margin: 0 auto var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-5);
`

const StyledAlertBox = styled(AlertBox)`
  width: 100%;
`

const SuccessWrapper = styled.div`
  padding: var(--spacing-2) var(--spacing-5);
  display: flex;
  margin: 0 auto;
  font-family: var(--button--font);

  text-transform: var(--input_button--text-transform);

  font-weight: var(--button--font-weight);
  color: var(--success-400);
  border: 2px solid var(--success-400);
  background-color: var(--success-600);
`

export default VoteDialog
