import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'

import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import AlertBox from '@/ui/AlertBox'
import ModalPendingTx from '@/ui/ModalPendingTx'

type Props = {
  userAddress: string
  activeProposal?: ActiveProposal
  testId?: string
  proposalId?: string
  votingPower: SnapshotVotingPower
  snapshotVotingPower: boolean
  className?: string
}

const VoteDialog = ({ userAddress, activeProposal, testId, className, votingPower, proposalId }: Props) => {
  const { castVote, voteTx, executeProposal, executeTx } = useStore((state) => state.proposals)
  const pricesProposal = useStore((state) => state.proposals.proposalMapper[proposalId ?? ''])
  const proposal = useStore((state) => state.proposals.proposalsMapper[proposalId ?? ''])
  const { userProposalVotesMapper } = useStore((state) => state.user)

  const voted = userProposalVotesMapper[userAddress].votes[proposalId ?? '']
  const votedFor = (userProposalVotesMapper[userAddress].votes[proposalId ?? '']?.vote_for ?? 0) > 0
  const votedAgainst = (userProposalVotesMapper[userAddress].votes[proposalId ?? '']?.vote_against ?? 0) > 0

  const votePercentage = (vote: number, total: number) => `(${((vote / total) * 100).toFixed(2)}%)`

  const executeProposalComponent = () => {
    const id = pricesProposal?.vote_id
    const type = pricesProposal?.vote_type

    return (
      <>
        {executeTx.status === 'LOADING' && (
          <Box>
            <ModalPendingTx
              transactionHash={executeTx.hash!}
              txLink={executeTx.txLink!}
              pendingMessage={t`Executing proposal...`}
            />
          </Box>
        )}
        {executeTx.status === 'ERROR' && (
          <Box>
            <StyledAlertBox alertType="error" limitHeight>
              {executeTx.error}
            </StyledAlertBox>
          </Box>
        )}
        {executeTx.status === 'SUCCESS' && <SuccessWrapper>{t`Proposal vote succesfully cast!`}</SuccessWrapper>}
        {executeTx.status !== 'SUCCESS' && (
          <ExecuteButton
            variant="icon-filled"
            onClick={() => executeProposal(id, type as ProposalType)}
            loading={executeTx.status === 'CONFIRMING' || executeTx.status === 'LOADING'}
          >
            {t`Execute`}
          </ExecuteButton>
        )}
      </>
    )
  }

  // Voting power too low
  if (activeProposal?.active && votingPower.value === 0) {
    return (
      <Wrapper className={className}>
        <VotingMessage>{t`Voting power too low to participate in this proposal.`}</VotingMessage>
      </Wrapper>
    )
  }

  // Voting has ended - no vote
  if (!activeProposal?.active && proposalId && !voted) {
    if (proposal.status !== 'Passed' && !proposal.executed) {
      return null
    }

    return (
      proposal.status === 'Passed' &&
      !pricesProposal?.executed && <Wrapper className={className}>{executeProposalComponent()}</Wrapper>
    )
  }

  // Voted successfully
  if (proposalId && voted) {
    return (
      <Wrapper className={className}>
        <Box flex flexColumn flexGap="var(--spacing-3)">
          <VotedMessageWrapper>
            <VotedMessage>{t`You have succesfully voted:`}</VotedMessage>
            <VotedMessage>
              {votedFor && (
                <VotedRow>
                  <VotedRowItem>
                    <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} /> {t`For`}
                  </VotedRowItem>
                  <VotedRowItem>
                    {formatNumber(userProposalVotesMapper[userAddress].votes[proposalId].vote_for, {
                      showDecimalIfSmallNumberOnly: true,
                    })}{' '}
                    {votePercentage(
                      userProposalVotesMapper[userAddress].votes[proposalId].vote_for,
                      userProposalVotesMapper[userAddress].votes[proposalId].vote_total_supply
                    )}
                  </VotedRowItem>
                </VotedRow>
              )}
              {votedAgainst && (
                <VotedRow>
                  <VotedRowItem>
                    <Icon color="var(--chart-red)" name="Misuse" size={16} /> {t`Against`}
                  </VotedRowItem>
                  <VotedRowItem>
                    {formatNumber(userProposalVotesMapper[userAddress].votes[proposalId].vote_against, {
                      showDecimalIfSmallNumberOnly: true,
                    })}{' '}
                    {votePercentage(
                      userProposalVotesMapper[userAddress].votes[proposalId].vote_against,
                      userProposalVotesMapper[userAddress].votes[proposalId].vote_total_supply
                    )}
                  </VotedRowItem>
                </VotedRow>
              )}
            </VotedMessage>
          </VotedMessageWrapper>
          {proposal.status === 'Passed' && !pricesProposal?.executed && executeProposalComponent()}
        </Box>
      </Wrapper>
    )
  }

  if (userProposalVotesMapper[userAddress].fetchingState === 'SUCCESS') {
    return (
      <Wrapper className={className}>
        {/* Vote */}
        <Box flex flexGap="var(--spacing-2)">
          <VoteButton
            isFor
            variant="icon-filled"
            onClick={() => castVote(1, 'PARAMETER', true)}
            loading={voteTx.status === 'CONFIRMING' || voteTx.status === 'LOADING'}
          >
            {t`Vote For`}
          </VoteButton>
          <VoteButton
            variant="icon-filled"
            onClick={() => castVote(1, 'PARAMETER', false)}
            loading={voteTx.status === 'CONFIRMING' || voteTx.status === 'LOADING'}
          >
            {t`Vote Against`}
          </VoteButton>
        </Box>
      </Wrapper>
    )
  }

  return null
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const VotingMessage = styled.p`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  color: var(--button_outlined--color);
  font-weight: var(--semi-bold);
  font-size: var(--font-size-1);
  line-height: 1.2;
  background-color: var(--box_header--secondary--background-color);
  svg {
    color: var(--warning-400);
  }
`

const VotedMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  justify-content: space-between;
  background-color: var(--box_header--secondary--background-color);
  padding: var(--spacing-2);
`

const VotedMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-1);
  color: var(--button_outlined--color);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  line-height: 1.5;
`

const VotedRow = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--spacing-1);
  font-size: var(--font-size-2);
`

const VotedRowItem = styled.span`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  align-items: center;
`

const VoteButton = styled(Button)<{ isFor?: boolean }>`
  width: 50%;
  padding-top: var(--spacing-2);
  padding-bottom: var(--spacing-2);
  color: var(--text-color);
  ${({ isFor }) => {
    if (isFor) {
      return `
        background-color: var(--chart-green);
        border: 1px solid var(--chart-green);
        color: var(--white);
        &:hover {
          background-color: var(--chart-green);
          opacity: 0.8;
        }
      `
    } else if (!isFor) {
      return `
        background-color: var(--chart-red);
        border: 1px solid var(--chart-red);
        color: var(--white);
        &:hover {
          background-color: var(--chart-red);
          opacity: 0.8;
        }
      `
    }
    return ''
  }}
`

const ExecuteButton = styled(VoteButton)``

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
