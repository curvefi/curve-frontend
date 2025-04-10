import { useMemo } from 'react'
import styled from 'styled-components'
import { MetricsTitle } from '@/dao/components/MetricsComp'
import { ProposalData } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import Box from '@ui/Box'
import { InternalLink } from '@ui/Link'
import { convertToLocaleTimestamp, formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'

type ProposalInformationProps = {
  proposal: ProposalData
  snapshotBlock: number
}

const ProposalInformation = ({ proposal, snapshotBlock }: ProposalInformationProps) => {
  const createdDate = useMemo(
    () =>
      proposal?.startDate ? formatDate(new Date(convertToLocaleTimestamp(proposal.startDate) * 1000), 'long') : '-',
    [proposal?.startDate],
  )
  const endDate = useMemo(
    () =>
      proposal?.startDate
        ? formatDate(new Date(convertToLocaleTimestamp(proposal.startDate + 604800) * 1000), 'long')
        : '-',
    [proposal?.startDate],
  )

  return (
    <Wrapper>
      <Box>
        <MetricsTitle>{t`Proposer`}</MetricsTitle>
        <StyledInternalLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${proposal?.creator}`)}>
          {shortenAddress(proposal?.creator)}
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

  &:hover {
    cursor: pointer;
  }
`

export default ProposalInformation
