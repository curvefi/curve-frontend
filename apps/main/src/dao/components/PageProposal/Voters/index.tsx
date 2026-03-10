import { Chain } from 'curve-ui-kit/src/utils/network'
import { styled } from 'styled-components'
import { useProposalPricesApiQuery } from '@/dao/entities/proposal-prices-api'
import { networks } from '@/dao/networks'
import { getEthPath } from '@/dao/utils'
import type { ProposalType } from '@curvefi/prices-api/proposal/models'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { ExternalLink, InternalLink } from '@ui/Link'
import { formatNumber, scanTxPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'

type Props = {
  totalVotes: number
  voteId: string
  proposalType: ProposalType
  className?: string
}

export const Voters = ({ totalVotes, voteId, proposalType, className }: Props) => {
  const { data: pricesProposal, isSuccess: pricesProposalSuccess } = useProposalPricesApiQuery({
    proposalId: +voteId,
    proposalType,
  })

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
            <Data className="align-right">{formatNumber(pricesProposal?.voteCount, { notation: 'compact' })}</Data>
          </Box>
        </Box>
      </TotalWrapper>
      {pricesProposal && pricesProposalSuccess && pricesProposal.votes.length !== 0 && (
        <VotesWrapper>
          <Box flex flexJustifyContent="space-between">
            <SubTitle>{t`Voter`}</SubTitle>
            <SubTitle>{t`Power`}</SubTitle>
          </Box>
          <VotesContainer>
            {pricesProposal.votes.map((vote) => (
              <DataRow key={`${vote.txHash}-${vote.supports}`}>
                <Box flex>
                  {vote.supports ? (
                    <ForIcon name="CheckmarkFilled" size={16} />
                  ) : (
                    <AgainstIcon name="Misuse" size={16} />
                  )}
                  <StyledInternalLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${vote.voter}`)}>
                    {vote.topHolder ? vote.topHolder : shortenAddress(vote.voter)}
                  </StyledInternalLink>
                </Box>
                <StyledExternalLink href={scanTxPath(networks[Chain.Ethereum], vote.txHash)}>
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
  display: flex;
  flex-direction: column;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  text-decoration: none;
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
