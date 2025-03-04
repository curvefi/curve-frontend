import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import { useRouter } from 'next/navigation'

import { shortenTokenAddress, formatNumber } from '@ui/utils'
import useStore from '@/dao/store/useStore'
import networks from '@/dao/networks'

import Box from '@ui/Box'
import { ExternalLink, InternalLink } from '@ui/Link'
import Icon from '@ui/Icon'
import { getEthPath } from '@/dao/utils'
import { DAO_ROUTES } from '@ui-kit/shared/routes'

type Props = {
  totalVotes: number
  rProposalId: string
  className?: string
}

const Voters = ({ totalVotes, rProposalId, className }: Props) => {
  const proposalLoadingState = useStore((state) => state.proposals.proposalLoadingState)
  const currentProposal = useStore((state) => state.proposals.proposalMapper[rProposalId])
  const { push } = useRouter()

  return (
    <Wrapper className={className}>
      <TotalWrapper>
        <Box>
          <SubTitle>{t`Total Votes`}</SubTitle>
          <Box>
            <Data>{formatNumber(totalVotes, { notation: 'compact' })} veCRV</Data>
          </Box>
        </Box>
        <Box>
          <SubTitle>{t`Voters`}</SubTitle>
          <Box>
            <Data className="align-right">{formatNumber(currentProposal?.vote_count, { notation: 'compact' })}</Data>
          </Box>
        </Box>
      </TotalWrapper>
      {currentProposal && proposalLoadingState === 'SUCCESS' && currentProposal.votes.length !== 0 && (
        <VotesWrapper>
          <Box flex flexJustifyContent="space-between">
            <SubTitle>{t`Voter`}</SubTitle>
            <SubTitle>{t`Power`}</SubTitle>
          </Box>
          <VotesContainer>
            {currentProposal.votes.map((vote) => (
              <DataRow key={`${vote.transaction_hash}-${vote.supports}`}>
                <Box flex>
                  {vote.supports ? (
                    <ForIcon name="CheckmarkFilled" size={16} />
                  ) : (
                    <AgainstIcon name="Misuse" size={16} />
                  )}
                  <StyledInternalLink
                    onClick={(e) => {
                      e.preventDefault()
                      push(getEthPath(`${DAO_ROUTES.PAGE_USER}/${vote.voter}`))
                    }}
                  >
                    {vote.topHolder ? vote.topHolder : shortenTokenAddress(vote.voter)}
                  </StyledInternalLink>
                </Box>
                <StyledExternalLink href={networks[1].scanTxPath(vote.transaction_hash)}>
                  <Data>
                    {formatNumber(+vote.stake, { notation: 'compact' })} (
                    {formatNumber(vote.relativePower, { notation: 'compact' })}%)
                  </Data>
                </StyledExternalLink>
              </DataRow>
            ))}
          </VotesContainer>
        </VotesWrapper>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: 0 var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

const TotalWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const VotesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
`

const VotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  overflow-y: scroll;
  max-height: 30rem;
`

const DataRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px dashed var(--gray-500a25);
  padding-bottom: var(--spacing-2);
  &:last-child {
    border-bottom: none;
  }
`

const Data = styled.p`
  font-weight: var(--bold);
  font-size: var(--font-size-2);
  &.align-right {
    text-align: right;
  }
`

const StyledInternalLink = styled(InternalLink)`
  color: inherit;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  text-decoration: none;
  text-transform: none;
  display: flex;
  flex-direction: column;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  text-decoration: none;
  text-transform: none;
  display: flex;
  flex-direction: column;
`

const ForIcon = styled(Icon)`
  color: var(--chart-green);
  margin-right: var(--spacing-1);
`

const AgainstIcon = styled(Icon)`
  color: var(--chart-red);
  margin-right: var(--spacing-1);
`

export default Voters
