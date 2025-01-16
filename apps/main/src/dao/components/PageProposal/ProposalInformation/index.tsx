import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import { shortenTokenAddress, convertToLocaleTimestamp } from '@/ui/utils'

import Box from '@/ui/Box'
import { MetricsTitle } from '@/components/MetricsComp'
import { InternalLink } from '@/ui/Link'

type ProposalInformationProps = {
  proposal: ProposalData
  snapshotBlock: number
}

const ProposalInformation: React.FC<ProposalInformationProps> = ({ proposal, snapshotBlock }) => {
  const createdDate = useMemo(
    () => new Date(convertToLocaleTimestamp(proposal?.startDate) * 1000).toLocaleString(),
    [proposal?.startDate],
  )
  const endDate = useMemo(
    () => new Date(convertToLocaleTimestamp(proposal?.startDate + 604800) * 1000).toLocaleString(),
    [proposal?.startDate],
  )

  return (
    <Wrapper>
      <Box>
        <MetricsTitle>{t`Proposer`}</MetricsTitle>
        <StyledInternalLink href={`/ethereum/user/${proposal?.creator}`}>
          {shortenTokenAddress(proposal?.creator)}
        </StyledInternalLink>
      </Box>
      <Box>
        <MetricsTitle>{t`Created`}</MetricsTitle>
        <VoteInformationData>{createdDate}</VoteInformationData>
      </Box>
      <Box>
        <MetricsTitle>{t`Snapshot Block`}</MetricsTitle>
        <VoteInformationData>{snapshotBlock}</VoteInformationData>
      </Box>
      <Box>
        <MetricsTitle>{t`Ends`}</MetricsTitle>
        <VoteInformationData>{endDate}</VoteInformationData>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
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
  text-transform: none;

  &:hover {
    cursor: pointer;
  }
`

export default ProposalInformation
