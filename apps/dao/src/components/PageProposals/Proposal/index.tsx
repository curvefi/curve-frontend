import styled from 'styled-components'
import { t } from '@lingui/macro'
import { FunctionComponent, HTMLAttributes, useRef, useState, useEffect } from 'react'

import { shortenTokenAddress } from '@/ui/utils'
import networks from '@/networks'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'
import VoteCountdown from '../../VoteCountdown'
import VotesStatusBox from '../../VotesStatusBox'
import InternalLinkButton from '@/ui/InternalLinkButton'

type Props = {
  proposalData: ProposalData
  handleClick: (rProposalId: string) => void
}

const Proposal = ({
  proposalData: {
    voteId,
    voteType,
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
    executed,
    status,
    totalVotesPercentage,
  },
  handleClick,
}: Props) => {
  return (
    <LazyItem>
      <ProposalContainer onClick={() => handleClick(`${voteId}-${voteType}`)}>
        <InformationWrapper>
          <ProposalDetailsRow>
            <ProposalStatus
              className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
                status === 'Passed' && 'passed'
              }`}
            >
              {status}
            </ProposalStatus>
            <ProposalId>#{voteId}</ProposalId>
            <ProposalType>{voteType}</ProposalType>
            <StyledVoteCountdown startDate={startDate} />
          </ProposalDetailsRow>
          <ProposalMetadata>{metadata}</ProposalMetadata>
        </InformationWrapper>
        <VoteWrapper>
          <StyledVotesStatusBox
            votesFor={votesFor}
            votesAgainst={votesAgainst}
            totalVeCrv={totalVeCrv}
            totalVotesPercentage={totalVotesPercentage}
            minAcceptQuorumPercent={minAcceptQuorumPercent}
          />
        </VoteWrapper>
      </ProposalContainer>
    </LazyItem>
  )
}

const ProposalContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  background-color: var(--summary_content--background-color);
  &:hover {
    cursor: pointer;
  }
`

const InformationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  min-width: 100%;
`

const ProposalDetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
`

const ProposalId = styled.h4`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  padding-right: var(--spacing-2);
  padding-left: var(--spacing-1);
  border-right: 2px solid var(--gray-500);
`

const ProposalStatus = styled.h4`
  border: 1px solid var(--gray-500);
  font-size: var(--font-size-1);
  text-transform: uppercase;
  /* border-right: 2px solid var(--gray-500); */
  padding: 0.2rem 0.4rem;
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

const ProposalType = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const ProposalMetadata = styled.p`
  margin: auto 0;
  padding: var(--spacing-4) 0;
  margin-right: var(--spacing-3);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
`

const ProposalProposer = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  opacity: 0.7;
`

const StyledExternalLink = styled(ExternalLink)`
  margin-left: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  &:hover {
    cursor: pointer;
  }
`

const VoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  background-color: var(--blacka05);
`

const StyledVoteCountdown = styled(VoteCountdown)`
  margin-left: auto;
`

const StyledVotesStatusBox = styled(VotesStatusBox)`
  margin: var(--spacing-1) 0;
`

const Item = styled.div``

export const LazyItem: FunctionComponent<HTMLAttributes<HTMLDivElement>> = ({ children, id, style, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { isIntersecting: isVisible } = useIntersectionObserver(ref) ?? {}

  // when rendered items might get larger. So we have that in the state to avoid stuttering
  const [height, setHeight] = useState<string>('241px') // default height on desktop
  useEffect(() => {
    if (isVisible && ref.current) {
      setHeight(`${ref.current.clientHeight}px`)
    }
  }, [isVisible])

  return (
    <Item ref={ref} id={id} style={{ ...style, ...(!isVisible && { height }) }} {...props}>
      {isVisible && children}
    </Item>
  )
}

export default Proposal
