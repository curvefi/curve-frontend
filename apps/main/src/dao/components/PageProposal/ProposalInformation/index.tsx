import { useMemo } from 'react'
import { styled } from 'styled-components'
import { MetricsTitle } from '@/dao/components/MetricsComp'
import { ProposalData } from '@/dao/entities/proposals-mapper'
import { DAO_ROUTES } from '@evm-ui/shared/routes'
import { shortenAddress } from '@evm-ui/utils/address'
import { Box } from '@legacy-ui/Box'
import { InternalLink } from '@legacy-ui/Link'
import { formatDateFromTimestamp } from '@primitives/date.utils'
import { t } from '@ui/lib/i18n'
import { TIME_FRAMES } from '@ui/lib/time'

type ProposalInformationProps = { proposal: ProposalData | null }

export const ProposalInformation = ({ proposal }: ProposalInformationProps) => {
  const proposer = proposal?.proposer
  const timestamp = proposal?.timestamp
  const [createdDate, endDate] = useMemo(
    () =>
      timestamp ? [0, TIME_FRAMES.WEEK].map(offset => formatDateFromTimestamp(timestamp + offset, 'long')) : ['-', '-'],
    [timestamp],
  )

  return (
    <Wrapper>
      <Box>
        <MetricsTitle>{t`Proposer`}</MetricsTitle>
        <StyledInternalLink
          href={DAO_ROUTES.PAGE_USER({ app: 'dao', blockchainId: 'ethereum', userAddress: proposer! })}
        >
          {shortenAddress(proposer)}
        </StyledInternalLink>
      </Box>
      <Box>
        <MetricsTitle>{t`Created`}</MetricsTitle>
        <VoteInformationData>{createdDate}</VoteInformationData>
      </Box>
      <Box>
        <MetricsTitle>{t`Snapshot Block`}</MetricsTitle>
        <VoteInformationData>{proposal?.block}</VoteInformationData>
      </Box>
      <Box>
        <MetricsTitle>{t`Ends`}</MetricsTitle>
        <VoteInformationData>{endDate}</VoteInformationData>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 0.7fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-3);
  font-variant-numeric: tabular-nums;
`

const VoteInformationData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  font-variant-numeric: tabular-nums;
`

const StyledInternalLink = styled(InternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);

  &:hover {
    cursor: pointer;
  }
`
