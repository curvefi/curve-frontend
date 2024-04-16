import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'

import Button from '@/ui/Button'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import VoteCountdown from '../VoteCountdown'
import Script from './components/Script'
import VoteBox from '../VoteBox'
import Voters from './Voters'
import UserBox from './UserBox'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Loader from 'ui/src/Loader/Loader'
import { shortenTokenAddress } from '@/ui/utils'

type Props = {
  routerParams: {
    rChainId: ChainId
    rProposalId: string
  }
}

const Proposal = ({ routerParams: { rChainId, rProposalId } }: Props) => {
  const [voteId, voteType] = rProposalId.split('-')

  const navigate = useNavigate()
  const { proposalsLoading, getProposal, currentProposal, pricesProposalLoading } = useStore(
    (state) => state.daoProposals
  )
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)

  const proposal = useStore((state) => state.daoProposals.proposalsMapper[rProposalId] ?? null)

  const {
    creator,
    startDate,
    snapshotBlock,
    ipfsMetadata,
    metadata,
    votesFor,
    votesAgainst,
    voteCount,
    supportRequired,
    minAcceptQuorumPercent,
    totalVeCrv,
    totalVotes,
    totalVotesPercentage,
    executed,
    status,
  } = proposal ?? {}

  useEffect(() => {
    if (rChainId && voteId && voteType) {
      getProposal(+voteId, voteType.toLowerCase())
    }
  }, [getProposal, voteId, voteType, isLoadingCurve, rChainId])

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
          <ProposalTopBar>
            <TopBarColumn>
              <SubTitle>{t`Status`}</SubTitle>
              {!proposal ? (
                <Loader skeleton={[56, 16.5]} />
              ) : (
                <Status
                  className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
                    status === 'Passed' && 'passed'
                  }`}
                >
                  {status}
                </Status>
              )}
            </TopBarColumn>
            <TopBarColumn>
              <SubTitle>{t`Proposal ID`}</SubTitle>
              <h3>#{voteId}</h3>
            </TopBarColumn>
            <TopBarColumn>
              <SubTitle>{t`Proposal Type`}</SubTitle>
              <h3>{voteType}</h3>
            </TopBarColumn>
            <TopBarColumn margin="0 0 0 auto">
              <SubTitle className="align-right">{t`Time Remaining`}</SubTitle>
              {!proposal ? <StyledLoader skeleton={[56, 16.5]} /> : <VoteCountdown startDate={startDate} />}
            </TopBarColumn>
          </ProposalTopBar>
          {!currentProposal || !proposal ? (
            <StyledSpinnerWrapper>
              <Spinner />
            </StyledSpinnerWrapper>
          ) : (
            <>
              <MetaData>
                <SubTitle>{t`Metadata`}</SubTitle>
                <p>{metadata}</p>
              </MetaData>
              {currentProposal && <Script script={currentProposal.script} />}
              <TimelineBox>
                <Box>
                  <SubTitle>{t`Proposer`}</SubTitle>
                  <StyledExternalLink href={networks[1].scanAddressPath(creator)}>
                    {shortenTokenAddress(creator)}
                  </StyledExternalLink>
                </Box>
                <Box>
                  <SubTitle>{t`Created`}</SubTitle>
                  <Time>{new Date(convertToLocaleTimestamp(startDate) * 1000).toLocaleString()}</Time>
                </Box>
                <Box>
                  <SubTitle>{t`Ends`}</SubTitle>
                  <Time>{new Date(convertToLocaleTimestamp(startDate + 604800) * 1000).toLocaleString()}</Time>
                </Box>
              </TimelineBox>
            </>
          )}
        </ProposalContainer>

        <Box display="flex" flexColumn margin="0 0 auto var(--spacing-1)">
          <UserBox />
          {proposal && (
            <>
              <VoteState variant="secondary">
                <VoteBox
                  votesFor={votesFor}
                  votesAgainst={votesAgainst}
                  totalVeCrv={totalVeCrv}
                  minAcceptQuorumPercent={minAcceptQuorumPercent}
                  totalVotesPercentage={totalVotesPercentage}
                />
              </VoteState>
              <Voters totalVotes={totalVotes} />
            </>
          )}
        </Box>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-5) auto var(--spacing-6);
  width: 60rem;
  flex-grow: 1;
  min-height: 100%;
`

const ProposalContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: auto;
`

const BackButtonWrapper = styled(Box)`
  margin-right: auto;
  margin-bottom: var(--spacing-2);
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
    margin-left: auto;
  }
`

const ProposalTopBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-3);
  background-color: var(--gray-500a20);
  padding: var(--spacing-3);
`

const Status = styled.h3`
  font-size: var(--font-size-2);
  display: flex;
  &.passed {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--success-400);
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
      background: var(--danger-400);
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
      background: var(--warning-400);
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
  h3 {
    font-size: var(--font-size-2);
  }
`

const MetaData = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-3);
  p {
    font-size: var(--font-size-2);
    line-height: 1.5;
    max-width: 40rem;
    font-weight: var(--semi-bold);
    white-space: pre-wrap;
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);

  &:hover {
    cursor: pointer;
  }
`

const TimelineBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: var(--spacing-3);
  gap: var(--spacing-3);
  border-top: 2px solid var(--gray-500a20);
  font-variant-numeric: tabular-nums;
`

const Time = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  font-variant-numeric: tabular-nums;
`

const VoteState = styled(Box)`
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
  width: 39.75rem;
  max-width: 100%;
`

export default Proposal
