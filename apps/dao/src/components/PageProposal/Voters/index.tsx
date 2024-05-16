import styled from 'styled-components'
import { t } from '@lingui/macro'

import { shortenTokenAddress, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'

import { formatNumberWithSuffix } from '@/ui/utils'

import Box from '@/ui/Box'
import { ExternalLink } from '@/ui/Link'
import Icon from '@/ui/Icon'

type Props = {
  totalVotes: number
  rProposalId: string
}

const Voters = ({ totalVotes, rProposalId }: Props) => {
  const pricesProposalLoadingState = useStore((state) => state.proposals.pricesProposalLoadingState)
  const currentProposal = useStore((state) => state.proposals.pricesProposalMapper[rProposalId])

  return (
    <Wrapper variant="secondary">
      <TotalWrapper>
        <Box>
          <SubTitle>{t`Total Votes`}</SubTitle>
          <Box>
            <Data>{formatNumber(totalVotes)} veCRV</Data>
          </Box>
        </Box>
        <Box>
          <SubTitle>{t`Voters`}</SubTitle>
          <Box>
            <Data className="align-right">{formatNumber(currentProposal?.vote_count)}</Data>
          </Box>
        </Box>
      </TotalWrapper>
      {currentProposal && pricesProposalLoadingState === 'SUCCESS' && currentProposal.votes.length !== 0 && (
        <VotesWrapper>
          <Box flex flexJustifyContent="space-between">
            <SubTitle>{t`Voter`}</SubTitle>
            <SubTitle>{t`Power`}</SubTitle>
          </Box>
          <VotesContainer>
            {currentProposal.votes.map((vote) => (
              <DataRow key={vote.transaction_hash}>
                <Box flex>
                  {vote.supports ? (
                    <ForIcon name="CheckmarkFilled" size={16} />
                  ) : (
                    <AgainstIcon name="Misuse" size={16} />
                  )}
                  <StyledExternalLink href={`https://etherscan.io/address/${vote.voter}`}>
                    {shortenTokenAddress(vote.voter)}
                  </StyledExternalLink>
                </Box>
                <StyledExternalLink href={networks[1].scanTxPath(vote.transaction_hash)}>
                  <Data>
                    {formatNumberWithSuffix(+vote.voting_power)} ({vote.relative_power.toFixed(2)}%)
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
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-1);
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
  max-height: 20rem;
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
