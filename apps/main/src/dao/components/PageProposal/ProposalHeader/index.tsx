import { Chain } from 'curve-ui-kit/src/utils/network'
import { styled } from 'styled-components'
import { Countdown } from '@/dao/components/Countdown'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import { SmallLabel } from '@/dao/components/SmallLabel'
import { ProposalData } from '@/dao/entities/proposals-mapper'
import { networks } from '@/dao/networks'
import { ExternalLink } from '@ui/Link'
import { formatDate, scanTxPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type ProposalHeaderProps = {
  proposal: ProposalData | null
  loading: boolean
  voteId: string
  proposalType: string
}

export const ProposalHeader = ({ proposal, loading, voteId, proposalType }: ProposalHeaderProps) => {
  const { status, executed, timestamp, executionDate, executionTx } = proposal ?? {}

  return (
    <Wrapper>
      <SmallLabel
        className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
          status === 'Passed' && 'passed'
        }`}
        description={<Status className={status}>{status}</Status>}
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
      <MetricsComp title={t`Proposal ID`} data={<MetricsColumnData>#{voteId}</MetricsColumnData>} />
      <MetricsComp title={t`Proposal Type`} data={<MetricsColumnData capitalize>{proposalType}</MetricsColumnData>} />
      {executed && executionDate && executionTx ? (
        <MetricsComp
          title={t`Executed On`}
          data={
            <StyledExternalLink href={scanTxPath(networks[Chain.Ethereum], executionTx)}>
              <MetricsColumnData>{formatDate(executionDate)}</MetricsColumnData>
            </StyledExternalLink>
          }
        />
      ) : (
        <TimeRemainingBox
          loading={loading}
          title={t`Time Remaining`}
          data={<StyledCountdown startDate={timestamp ?? null} />}
        />
      )}
    </Wrapper>
  )
}

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
    &:before {
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
    &:before {
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
    &:before {
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
    &:before {
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
    &:before {
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
    &:before {
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
    &:before {
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

const StyledCountdown = styled(Countdown)`
  margin-top: var(--spacing-1);
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-decoration: none;
`
