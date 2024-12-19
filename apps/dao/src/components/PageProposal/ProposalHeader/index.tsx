import styled from 'styled-components'
import { t } from '@lingui/macro'

import SmallLabel from '@/components/SmallLabel'
import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import VoteCountdown from '@/components/VoteCountdown'

type ProposalHeaderProps = {
  proposal: ProposalData
  voteId: string
  voteType: string
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({ proposal, voteId, voteType }) => (
    <Wrapper>
      <SmallLabel
        className={`${proposal?.status === 'Active' && 'active'} ${proposal?.status === 'Denied' && 'denied'} ${
          proposal?.status === 'Passed' && 'passed'
        }`}
        description={<Status className={proposal?.status}>{proposal?.status}</Status>}
      />
      {proposal?.status === 'Passed' && (
        <SmallLabel
          description={
            <ExecutedStatus className={proposal?.executed ? 'executed' : 'executable'}>
              {proposal?.executed ? t`Executed` : t`Executable`}
            </ExecutedStatus>
          }
        />
      )}
      <MetricsComp loading={false} title={t`Proposal ID`} data={<MetricsColumnData>#{voteId}</MetricsColumnData>} />
      <MetricsComp loading={false} title={t`Proposal Type`} data={<MetricsColumnData>{voteType}</MetricsColumnData>} />
      <TimeRemainingBox
        loading={!proposal}
        title={t`Time Remaining`}
        data={<StyledVoteCountdown startDate={proposal?.startDate} />}
      />
    </Wrapper>
  )

const Wrapper = styled.div`
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
      background: var(--chart-liq-range);
      border-radius: 50%;
    }
  }
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
      background: var(--chart-liq-range);
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
      background: var(--chart-liq-range);
      border-radius: 50%;
    }
  }
`

const TimeRemainingBox = styled(MetricsComp)`
  @media (min-width: 32.5rem) {
    margin: 0 0 0 auto;
    text-align: right;
  }
`

const StyledVoteCountdown = styled(VoteCountdown)`
  margin-top: var(--spacing-1);
`

export default ProposalHeader
