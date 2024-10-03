import styled from 'styled-components'
import { useCallback } from 'react'
import { t } from '@lingui/macro'

import VoteCountdown from '../../VoteCountdown'
import ProposalVoteStatusBox from '@/components/ProposalVoteStatusBox'
import LazyItem from '@/ui/LazyItem'
import SmallLabel from '@/components/SmallLabel'

type Props = {
  proposalData: ProposalData
  handleClick: (rProposalId: string) => void
}

const Proposal = ({ proposalData, handleClick }: Props) => {
  const { voteId, voteType, startDate, metadata, status, executed } = proposalData

  const truncateMetadata = useCallback((metadata: string | null, maxLength: number) => {
    if (!metadata) {
      return ''
    }
    if (metadata.length <= maxLength) {
      return metadata
    }
    return metadata.slice(0, maxLength) + '...'
  }, [])

  return (
    <LazyItem defaultHeight="241px">
      <ProposalContainer onClick={() => handleClick(`${voteId}-${voteType}`)}>
        <InformationWrapper>
          <ProposalDetailsRow>
            <SmallLabel
              className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
                status === 'Passed' && 'passed'
              }`}
              description={<ProposalStatus className={status}>{status}</ProposalStatus>}
            />
            {status === 'Passed' && (
              <SmallLabel
                description={
                  <ExecutedStatus className={executed ? 'executed' : 'executable'}>
                    {executed ? t`Executed` : t`Executable`}
                  </ExecutedStatus>
                }
              />
            )}
            <ProposalId>#{voteId}</ProposalId>
            <ProposalType>{voteType}</ProposalType>
            <StyledVoteCountdown startDate={startDate} />
          </ProposalDetailsRow>
          <ProposalMetadata>{truncateMetadata(metadata, 300)}</ProposalMetadata>
        </InformationWrapper>
        <VoteWrapper>
          <StyledProposalVoteStatusBox proposalData={proposalData} />
        </VoteWrapper>
      </ProposalContainer>
    </LazyItem>
  )
}

const ProposalContainer = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto;
  background-color: var(--summary_content--background-color);
  @media (min-width: 56.25rem) {
    grid-template-columns: auto 19.375rem;
  }
  &:hover {
    cursor: pointer;
  }
`

const InformationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
  min-width: 100%;
  @media (min-width: 46.875rem) {
    padding: var(--spacing-3);
  }
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
  font-size: var(--font-size-1);
  text-transform: uppercase;
  &.Passed {
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
  &.Denied {
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
  &.Active {
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
  border-right: 2px solid var(--gray-500);
  padding-right: var(--spacing-2);
  @media (max-width: 28.125rem) {
    display: none;
  }
`

const ProposalMetadata = styled.p`
  padding-top: var(--spacing-3);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  max-width: 34.375rem;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
  @media (min-width: 46.875rem) {
    padding: var(--spacing-4) 0;
    margin: auto var(--spacing-3) auto 0;
  }
`

const VoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto 0;
  padding: var(--spacing-3);
`

const StyledVoteCountdown = styled(VoteCountdown)``

const ExecutedStatus = styled.h4`
  font-size: var(--font-size-1);
  text-transform: uppercase;
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

const StyledProposalVoteStatusBox = styled(ProposalVoteStatusBox)`
  margin: var(--spacing-1) 0;
`

export default Proposal