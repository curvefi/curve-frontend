import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'

import useStore from '@/store/useStore'
import { copyToClipboard } from '@/utils'
import { breakpoints } from '@/ui/utils'

import useProposalsMapper from '@/hooks/useProposalsMapper'
import useProposalMapper from '@/hooks/useProposalMapper'

import IconButton from '@/ui/IconButton'
import Tooltip from '@/ui/Tooltip'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import Script from './components/Script'
import ProposalVoteStatusBox from '../ProposalVoteStatusBox'
import Voters from './Voters'
import UserBox from '../UserBox'
import VoteDialog from '../UserBox/VoteDialog'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import { MetricsTitle } from '@/components/MetricsComp'
import BackButton from '../BackButton'
import ProposalHeader from './ProposalHeader'
import ProposalInformation from './ProposalInformation'

type ProposalProps = {
  routerParams: {
    rProposalId: string
  }
}

const Proposal: React.FC<ProposalProps> = ({ routerParams: { rProposalId } }) => {
  const [voteId, voteType] = rProposalId.split('-') as [string, ProposalType]
  const provider = useStore((state) => state.wallet.getProvider(''))
  const { proposalsLoadingState, getProposal, proposalLoadingState, getUserProposalVote } = useStore(
    (state) => state.proposals,
  )
  const userProposalVote = useStore((state) => state.proposals.userProposalVoteMapper[`${voteId}-${voteType}`]) ?? null
  const { setSnapshotVeCrv, userAddress, userProposalVotesMapper } = useStore((state) => state.user)
  const snapshotVeCrv = useStore((state) => state.user.snapshotVeCrvMapper[rProposalId])
  const { proposalMapper } = useProposalMapper()
  const { proposalsMapper } = useProposalsMapper()
  const pricesProposal = proposalMapper[rProposalId] ?? null
  const proposal = proposalsMapper[rProposalId] ?? null

  const isLoading =
    proposalLoadingState === 'LOADING' ||
    proposalsLoadingState === 'LOADING' ||
    (!pricesProposal && proposalsLoadingState !== 'ERROR')
  const isError = proposalLoadingState === 'ERROR'
  const isFetched = proposalLoadingState === 'SUCCESS' && proposalsLoadingState === 'SUCCESS' && pricesProposal

  const activeProposal = useMemo(
    () =>
      proposal?.status === 'Active'
        ? {
            active: true,
            startTimestamp: proposal?.startDate,
            endTimestamp: proposal?.startDate + 604800,
          }
        : undefined,
    [proposal?.status, proposal?.startDate],
  )

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  useEffect(() => {
    if (snapshotVeCrv === undefined && provider && userAddress && proposal?.snapshotBlock) {
      const getVeCrv = async () => {
        const signer = await provider.getSigner()
        setSnapshotVeCrv(signer, userAddress, proposal.snapshotBlock, rProposalId)
      }

      getVeCrv()
    }
  }, [provider, rProposalId, setSnapshotVeCrv, proposal?.snapshotBlock, snapshotVeCrv, userAddress])

  useEffect(() => {
    if (pricesProposal) return
    getProposal(+voteId, voteType)
  }, [getProposal, pricesProposal, voteId, voteType])

  // check to see if a user has voted and it has not yet been updated by the API
  useEffect(() => {
    if (!userAddress || (userProposalVote && userProposalVote.fetchingState !== null)) {
      return
    }

    const userVotes = userProposalVotesMapper[userAddress]

    if (userVotes.votes[rProposalId]) {
      return
    }

    getUserProposalVote(userAddress, voteId, voteType)
  }, [getUserProposalVote, rProposalId, userAddress, userProposalVote, userProposalVotesMapper, voteId, voteType])

  return (
    <Wrapper>
      <BackButton path="/ethereum/proposals" label={t`Back to proposals`} />
      <Box flex>
        <Box flex flexDirection="column" flexGap="var(--spacing-1)" style={{ width: '100%' }}>
          <ProposalContainer variant="secondary">
            <ProposalHeader proposal={proposal} voteId={voteId} voteType={voteType} />
            {isError && !isLoading && (
              <ErrorWrapper>
                <ErrorMessage
                  message={t`Error loading proposal data`}
                  onClick={() => getProposal(+voteId, voteType as ProposalType)}
                />
              </ErrorWrapper>
            )}
            {isLoading && (
              <StyledSpinnerWrapper>
                <Spinner />
              </StyledSpinnerWrapper>
            )}
            {isFetched && (
              <>
                <MetaData>
                  <Box flex flexJustifyContent="space-between" flexAlignItems="end">
                    <MetadataTitle>{t`Metadata`}</MetadataTitle>
                    <Tooltip tooltip={t`Copy to clipboard`} minWidth="135px">
                      <StyledCopyButton size="medium" onClick={() => handleCopyClick(proposal?.ipfsMetadata)}>
                        {t`Raw IPFS`}
                        <Icon name="Copy" size={16} />
                      </StyledCopyButton>
                    </Tooltip>
                  </Box>
                  <MetaDataParaphraph>{proposal?.metadata}</MetaDataParaphraph>
                </MetaData>
                {pricesProposal && <Script script={pricesProposal?.script} />}

                {/* Votes and User Box inline on small screens */}
                <VotesAndUserBox>
                  {proposal && (
                    <Box padding="0 var(--spacing-3)">
                      <ProposalVoteStatusBox proposalData={proposal} />
                    </Box>
                  )}
                </VotesAndUserBox>
              </>
            )}
            {proposal && !isLoading && proposal?.voteCount !== 0 && (
              <Voters rProposalId={rProposalId} totalVotes={proposal?.totalVotes} />
            )}
            <ProposalInformationWrapper>
              <ProposalInformation proposal={proposal} snapshotBlock={proposal?.snapshotBlock ?? 0} />
            </ProposalInformationWrapper>
          </ProposalContainer>
          <UserSmScreenWrapper variant="secondary">
            <UserBox votingPower={snapshotVeCrv} snapshotVotingPower activeProposal={activeProposal}>
              {proposal && snapshotVeCrv !== undefined && !snapshotVeCrv.loading! && (
                <VoteDialog
                  userAddress={userAddress ?? ''}
                  snapshotVotingPower
                  activeProposal={activeProposal}
                  votingPower={snapshotVeCrv}
                  proposalId={rProposalId}
                />
              )}
            </UserBox>
          </UserSmScreenWrapper>
        </Box>

        <SecondColumnBox display="flex" flexColumn flexGap={'var(--spacing-1)'} margin="0 0 auto var(--spacing-1)">
          <Box variant="secondary">
            <UserBox
              votingPower={snapshotVeCrv}
              snapshotVotingPower
              activeProposal={
                proposal?.status === 'Active'
                  ? { active: true, startTimestamp: proposal?.startDate, endTimestamp: proposal?.startDate + 604800 }
                  : undefined
              }
            >
              {proposal && snapshotVeCrv !== undefined && !snapshotVeCrv.loading! && (
                <VoteDialog
                  userAddress={userAddress ?? ''}
                  snapshotVotingPower
                  activeProposal={activeProposal}
                  votingPower={snapshotVeCrv}
                  proposalId={rProposalId}
                />
              )}
            </UserBox>
          </Box>
          {proposal && (
            <>
              <VotesWrapper variant="secondary">
                <ProposalVoteStatusBox proposalData={proposal} />
              </VotesWrapper>
              <Box variant="secondary" padding="var(--spacing-3)">
                <ProposalInformation proposal={proposal} snapshotBlock={proposal?.snapshotBlock ?? 0} />
              </Box>
            </>
          )}
        </SecondColumnBox>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const ProposalContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: var(--spacing-4);
  margin-bottom: auto;
  padding-bottom: var(--spacing-4);
`

const SecondColumnBox = styled(Box)`
  width: 22.875rem;
  @media (max-width: 55.625rem) {
    display: none;
  }
`

const MetadataTitle = styled(MetricsTitle)`
  align-self: center;
  @media (min-width: ${breakpoints.sm}rem) {
    align-self: flex-end;
  }
`

const VotesAndUserBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const UserSmScreenWrapper = styled(Box)`
  border-top: 1px solid var(--border-color);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const ProposalInformationWrapper = styled.div`
  padding: 0 var(--spacing-3);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 39.75rem;
  max-width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4);
`

const MetaData = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-3);
`

const MetaDataParaphraph = styled.p`
  font-size: var(--font-size-2);
  line-height: 1.5;
  max-width: 40rem;
  font-weight: var(--semi-bold);
  white-space: pre-line;
  word-break: break-word;
`

const VotesWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  min-width: 20rem;
  gap: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  width: 100%;
  margin-bottom: var(--spacing-4);
`

const StyledCopyButton = styled(IconButton)`
  align-items: end;
  display: flex;
  gap: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  padding: 0 var(--spacing-1);
  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;
  min-height: var(--height-x-small);
  min-width: var(--height-x-small);
  &:hover {
    color: var(--button_icon--hover--color);
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

export default Proposal
