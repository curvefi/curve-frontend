import { styled } from 'styled-components'
import { PendingTx } from '@/dao/components/UserBox/PendingTx'
import { useProposalPricesApiQuery } from '@/dao/entities/proposal-prices-api'
import { useProposalsMapperQuery, createProposalKey } from '@/dao/entities/proposals-mapper'
import { useUserProposalVotesQuery } from '@/dao/entities/user-proposal-votes'
import { useStore } from '@/dao/store/useStore'
import { SnapshotVotingPower, ActiveProposal } from '@/dao/types/dao.types'
import { ProposalType } from '@curvefi/prices-api/proposal/models'
import type { Address } from '@primitives/address.utils'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  userAddress?: Address
  activeProposal?: ActiveProposal
  proposalId: number
  proposalType: ProposalType
  votingPower: SnapshotVotingPower
  snapshotVotingPower: boolean
  className?: string
}

const votePercentage = (vote: number, total: number) => `(${formatNumber((vote / total) * 100, { style: 'percent' })})`

export const VoteDialog = ({
  userAddress,
  activeProposal,
  className,
  votingPower,
  proposalId,
  proposalType,
}: Props) => {
  const { data: proposalsMapper } = useProposalsMapperQuery({})
  const { data: pricesProposal } = useProposalPricesApiQuery({ proposalId, proposalType })
  const { data: userProposalVotes, isSuccess: userProposalVotesSuccess } = useUserProposalVotesQuery({
    userAddress: userAddress ?? '',
  })
  const proposalKey = createProposalKey(proposalId, proposalType)
  const proposal = proposalsMapper?.[proposalKey] ?? null
  const castVote = useStore((state) => state.proposals.castVote)
  const voteTxMapper = useStore((state) => state.proposals.voteTxMapper)
  const executeProposal = useStore((state) => state.proposals.executeProposal)
  const executeTxMapper = useStore((state) => state.proposals.executeTxMapper)

  const voteTx = voteTxMapper[proposalKey] ?? null
  const executeTx = executeTxMapper[proposalKey] ?? null

  const votedFor = userProposalVotes?.[proposalKey] ? userProposalVotes[proposalKey].voteFor > 0 : false
  const votedAgainst = userProposalVotes?.[proposalKey] ? userProposalVotes[proposalKey].voteAgainst > 0 : false
  const voted = votedFor || votedAgainst

  const executeProposalComponent = () => (
    <>
      {executeTx?.status === 'LOADING' && (
        <Box>
          <PendingTx pendingMessage={t`Executing proposal...`} />
        </Box>
      )}
      {executeTx?.status === 'ERROR' && (
        <Box margin="0 0 var(--spacing-2) 0">
          <StyledAlertBox alertType="error" limitHeight>
            {executeTx?.error}
          </StyledAlertBox>
        </Box>
      )}
      {executeTx?.status === 'SUCCESS' && <SuccessWrapper>{t`Proposal vote succesfully cast!`}</SuccessWrapper>}
      {executeTx?.status !== 'SUCCESS' && (
        <ExecuteButton
          variant="icon-filled"
          onClick={() => executeProposal(proposalId, proposalType)}
          loading={executeTx?.status === 'CONFIRMING' || executeTx?.status === 'LOADING'}
        >
          {t`Execute`}
        </ExecuteButton>
      )}
    </>
  )

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
    if (proposal?.status !== 'Passed' && !proposal?.executed) {
      return null
    }

    return (
      proposal?.status === 'Passed' &&
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
              {userProposalVotes?.[proposalKey] && votedFor && (
                <VotedRow>
                  <VotedRowItem>
                    <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} /> {t`For`}
                  </VotedRowItem>
                  <VotedRowItem>
                    {formatNumber(userProposalVotes?.[proposalKey].voteFor)}{' '}
                    {votePercentage(
                      userProposalVotes[proposalKey].voteFor,
                      userProposalVotes[proposalKey].voteTotalSupply,
                    )}
                  </VotedRowItem>
                </VotedRow>
              )}
              {userProposalVotes?.[proposalKey] && votedAgainst && (
                <VotedRow>
                  <VotedRowItem>
                    <Icon color="var(--chart-red)" name="Misuse" size={16} /> {t`Against`}
                  </VotedRowItem>
                  <VotedRowItem>
                    {formatNumber(userProposalVotes?.[proposalKey].voteAgainst)}{' '}
                    {votePercentage(
                      userProposalVotes[proposalKey].voteAgainst,
                      userProposalVotes[proposalKey].voteTotalSupply,
                    )}
                  </VotedRowItem>
                </VotedRow>
              )}
            </VotedMessage>
          </VotedMessageWrapper>
          {proposal?.status === 'Passed' && !pricesProposal?.executed && executeProposalComponent()}
        </Box>
      </Wrapper>
    )
  }

  if (voteTx?.status === 'CONFIRMING' || voteTx?.status === 'LOADING') {
    return <PendingTx pendingMessage={t`Casting vote...`} />
  }

  if (userProposalVotesSuccess) {
    return (
      <Wrapper className={className}>
        {/* Vote */}
        <Box flex flexGap="var(--spacing-2)">
          <VoteButton
            isFor
            variant="icon-filled"
            onClick={() => castVote(proposalId, proposalType, true)}
            loading={false}
          >
            {t`Vote For`}
          </VoteButton>
          <VoteButton variant="icon-filled" onClick={() => castVote(proposalId, proposalType, false)} loading={false}>
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
        &:hover:not(:disabled):not(.loading),
        &:active:not(:disabled):not(.loading) {
          background-color: var(--chart-green);
          opacity: 0.8;
        }
      `
    } else if (!isFor) {
      return `
        background-color: var(--chart-red);
        border: 1px solid var(--chart-red);
        color: var(--white);
        &:hover:not(:disabled):not(.loading),
        &:active:not(:disabled):not(.loading) {
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
  text-align: center;
  font-family: var(--button--font);

  text-transform: var(--input_button--text-transform);

  font-weight: var(--button--font-weight);
  color: var(--success-400);
  border: 2px solid var(--success-400);
  background-color: var(--success-600);
`
