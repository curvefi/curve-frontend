import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'
import { copyToClipboard } from '@/utils'
import { shortenTokenAddress } from '@/ui/utils'

import useProposalsMapper from '@/hooks/useProposalsMapper'
import useCurveJsProposalMapper from '@/hooks/useCurveJsProposalMapper'

import Button from '@/ui/Button'
import IconButton from '@/ui/IconButton'
import Tooltip from '@/ui/Tooltip'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import VoteCountdown from '../VoteCountdown'
import Script from './components/Script'
import VotesStatusBox from '../VotesStatusBox'
import Voters from './Voters'
import UserBox from '../UserBox'
import VoteDialog from '../UserBox/VoteDialog'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Loader from 'ui/src/Loader/Loader'
import ErrorMessage from '@/components/ErrorMessage'

type Props = {
  routerParams: {
    rProposalId: string
  }
}

const Proposal = ({ routerParams: { rProposalId } }: Props) => {
  const [voteId, voteType] = rProposalId.split('-')
  const provider = useStore((state) => state.wallet.provider)
  const curve = useStore((state) => state.curve)
  const navigate = useNavigate()
  const { proposalsLoadingState, getProposal, curveJsProposalLoadingState } = useStore((state) => state.proposals)
  const { setSnapshotVeCrv, userAddress } = useStore((state) => state.user)
  const snapshotVeCrv = useStore((state) => state.user.snapshotVeCrvMapper[rProposalId])
  const { curveJsProposalMapper } = useCurveJsProposalMapper()
  const { proposalsMapper } = useProposalsMapper()
  const curveJsProposal = curveJsProposalMapper[rProposalId] ?? null
  const proposal = proposalsMapper[rProposalId] ?? null

  const isLoading =
    curveJsProposalLoadingState === 'LOADING' ||
    proposalsLoadingState === 'LOADING' ||
    (!curveJsProposal && proposalsLoadingState !== 'ERROR')
  const isError = curveJsProposalLoadingState === 'ERROR'
  const isFetched = curveJsProposalLoadingState === 'SUCCESS' && proposalsLoadingState === 'SUCCESS' && curveJsProposal

  const activeProposal = useMemo(
    () =>
      proposal?.status === 'Active'
        ? {
            active: true,
            startTimestamp: proposal?.startDate,
            endTimestamp: proposal?.startDate + 604800,
          }
        : undefined,
    [proposal?.status, proposal?.startDate]
  )

  const createdDate = useMemo(
    () => new Date(convertToLocaleTimestamp(proposal?.startDate) * 1000).toLocaleString(),
    [proposal?.startDate]
  )
  const endDate = useMemo(
    () => new Date(convertToLocaleTimestamp(proposal?.startDate + 604800) * 1000).toLocaleString(),
    [proposal?.startDate]
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
    if (curveJsProposal || !curve) return
    getProposal(curve, +voteId, voteType as 'PARAMETER' | 'OWNERSHIP')
  }, [curve, getProposal, curveJsProposal, voteId, voteType])

  return (
    <Wrapper>
      <BackButtonWrapper variant="secondary">
        <BackButton variant="text" onClick={() => navigate(`/ethereum/proposals/`)}>
          <Icon name="ArrowLeft" size={16} />
          {t`Back to proposals`}
        </BackButton>
      </BackButtonWrapper>
      <Box flex>
        <ProposalContainer variant="secondary">
          <ProposalHeader>
            <TopBarColumn>
              <SubTitle>{t`Status`}</SubTitle>
              {!proposal ? (
                <Loader isLightBg skeleton={[56, 16.5]} />
              ) : (
                <Status
                  className={`${proposal?.status === 'Active' && 'active'} ${
                    proposal?.status === 'Denied' && 'denied'
                  } ${proposal?.status === 'Passed' && 'passed'}`}
                >
                  {proposal?.status}
                </Status>
              )}
            </TopBarColumn>
            {proposal?.status === 'Passed' && (
              <TopBarColumn>
                <SubTitle>{t`Executed`}</SubTitle>
                <ExecutedStatus className={proposal?.executed ? 'executed' : 'executable'}>
                  {proposal?.executed ? t`Executed` : t`Executable`}
                </ExecutedStatus>
              </TopBarColumn>
            )}
            <TopBarColumn>
              <SubTitle>{t`Proposal ID`}</SubTitle>
              <TopBarData>#{voteId}</TopBarData>
            </TopBarColumn>
            <TopBarColumn>
              <SubTitle>{t`Proposal Type`}</SubTitle>
              <TopBarData>{voteType}</TopBarData>
            </TopBarColumn>
            <TimeRemainingBox>
              <SubTitle className="align-right">{t`Time Remaining`}</SubTitle>
              {!proposal ? (
                <StyledLoader isLightBg skeleton={[56, 16.5]} />
              ) : (
                <VoteCountdown startDate={proposal?.startDate} />
              )}
            </TimeRemainingBox>
          </ProposalHeader>
          {isError && !isLoading && (
            <ErrorWrapper>
              <ErrorMessage
                message={t`Error loading proposal data`}
                onClick={() => curve && getProposal(curve, +voteId, voteType as 'PARAMETER' | 'OWNERSHIP')}
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
                  <SubTitle>{t`Metadata`}</SubTitle>
                  <Tooltip tooltip={t`Copy to clipboard`} minWidth="135px">
                    <StyledCopyButton size="medium" onClick={() => handleCopyClick(proposal?.ipfsMetadata)}>
                      {t`Raw IPFS`}
                      <Icon name="Copy" size={16} />
                    </StyledCopyButton>
                  </Tooltip>
                </Box>
                <MetaDataParaphraph>{proposal?.metadata}</MetaDataParaphraph>
              </MetaData>
              {curveJsProposal && <Script script={curveJsProposal?.script} />}

              {/* Votes and User Box inline on small screens */}
              <VotesAndUserBox>
                {proposal && (
                  <Box padding="0 var(--spacing-3)">
                    <VotesStatusBox
                      votesFor={proposal?.votesFor}
                      votesAgainst={proposal?.votesAgainst}
                      totalVeCrv={proposal?.totalVeCrv}
                      quorumVeCrv={proposal?.quorumVeCrv}
                      minAcceptQuorumPercent={proposal?.minAcceptQuorumPercent}
                      currentQuorumPercentage={proposal?.currentQuorumPercentage}
                    />
                  </Box>
                )}
                <UserAndVotersBox>
                  {proposal && <StyledVoters rProposalId={rProposalId} totalVotes={proposal?.totalVotes} />}
                  <UserBoxWrapper variant="secondary">
                    <UserBox votingPower={snapshotVeCrv} snapshotVotingPower activeProposal={activeProposal}>
                      {proposal && snapshotVeCrv !== undefined && !snapshotVeCrv.loading! && (
                        <VoteDialog
                          snapshotVotingPower
                          activeProposal={activeProposal}
                          votingPower={snapshotVeCrv}
                          proposalId={rProposalId}
                        />
                      )}
                    </UserBox>
                  </UserBoxWrapper>
                </UserAndVotersBox>
              </VotesAndUserBox>

              <VoteInformationBox>
                <Box>
                  <SubTitle>{t`Proposer`}</SubTitle>
                  <StyledExternalLink href={networks[1].scanAddressPath(proposal?.creator)}>
                    {shortenTokenAddress(proposal?.creator)}
                    <Icon name="Launch" size={16} />
                  </StyledExternalLink>
                </Box>
                <Box>
                  <SubTitle>{t`Created`}</SubTitle>
                  <VoteInformationData>{createdDate}</VoteInformationData>
                </Box>
                <Box>
                  <SubTitle>{t`Snapshot Block`}</SubTitle>
                  <VoteInformationData>{curveJsProposal?.snapshotBlock}</VoteInformationData>
                </Box>
                <Box>
                  <SubTitle>{t`Ends`}</SubTitle>
                  <VoteInformationData>{endDate}</VoteInformationData>
                </Box>
              </VoteInformationBox>
            </>
          )}
        </ProposalContainer>

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
                <VotesStatusBox
                  votesFor={proposal?.votesFor}
                  votesAgainst={proposal?.votesAgainst}
                  totalVeCrv={proposal?.totalVeCrv}
                  quorumVeCrv={proposal?.quorumVeCrv}
                  minAcceptQuorumPercent={proposal?.minAcceptQuorumPercent}
                  currentQuorumPercentage={proposal?.currentQuorumPercentage}
                />
              </VotesWrapper>
              <Box variant="secondary">
                <Voters rProposalId={rProposalId} totalVotes={proposal?.totalVotes} />
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
  gap: var(--spacing-4);
  margin-bottom: auto;
`

const SecondColumnBox = styled(Box)`
  @media (max-width: 55.625rem) {
    display: none;
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

const UserAndVotersBox = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto;
  gap: var(--spacing-4);
  @media (min-width: 41.875rem) {
    gap: 0;
    grid-template-columns: auto 20rem;
  }
`

const UserBoxWrapper = styled(Box)`
  margin: 0 var(--spacing-3);
  @media (min-width: 41.875rem) {
    margin: var(--spacing-3) var(--spacing-3) auto 0;
  }
`

const StyledVoters = styled(Voters)`
  width: 100%;
`

const BackButtonWrapper = styled(Box)`
  margin: 0 auto var(--spacing-2) var(--spacing-3);
`

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-2);
  gap: var(--spacing-2);
  color: var(--page--text-color);
`

const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
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

const ProposalHeader = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
  padding: var(--spacing-3);
`

const Status = styled.h3`
  font-size: var(--font-size-2);
  &.passed {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--chart-green);
      border-radius: 50%;
    }
  }
  &.denied {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--chart-red);
      border-radius: 50%;
    }
  }
  &.active {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--chart-orange);
      border-radius: 50%;
    }
  }
`

const ExecutedStatus = styled.h3`
  font-size: var(--font-size-2);
  &.executed {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--chart-green);
      border-radius: 50%;
    }
  }
  &.executable {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--chart-orange);
      border-radius: 50%;
    }
  }
`

const TopBarColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
`

const TopBarData = styled.h3`
  font-size: var(--font-size-2);
`

const TimeRemainingBox = styled(TopBarColumn)`
  @media (min-width: 32.5rem) {
    margin: 0 0 0 auto;
  }
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

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-transform: none;
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

const VoteInformationBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: var(--spacing-3);
  gap: var(--spacing-3);
  border-top: 1px solid var(--gray-500a20);
  font-variant-numeric: tabular-nums;
`

const VoteInformationData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  font-variant-numeric: tabular-nums;
`

const VotesWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  min-width: 20rem;
  gap: var(--spacing-2);
`

const StyledLoader = styled(Loader)`
  margin-left: auto;
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
