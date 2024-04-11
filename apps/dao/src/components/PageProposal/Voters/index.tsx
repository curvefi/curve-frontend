import styled from 'styled-components'

import { shortenTokenAddress, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'

import Box from '@/ui/Box'
import { ExternalLink } from '@/ui/Link'
import Icon from '@/ui/Icon'

type Props = {
  totalVotes: number
}

const Voters = ({ totalVotes }: Props) => {
  const { currentProposal, pricesProposalLoading } = useStore((state) => state.daoProposals)

  console.log(currentProposal?.votes)

  return (
    <Wrapper variant="secondary">
      <TotalWrapper>
        <Box>
          <SubTitle>Total Votes</SubTitle>
          <Box>
            <Data>{formatNumber(totalVotes)} veCRV</Data>
          </Box>
        </Box>
        <Box>
          <SubTitle>Voters</SubTitle>
          <Box>
            <Data className="align-right">{formatNumber(currentProposal?.vote_count)}</Data>
          </Box>
        </Box>
      </TotalWrapper>
      <VotesWrapper>
        <Box flex flexJustifyContent="space-between">
          <SubTitle>Voter</SubTitle>
          <SubTitle>Power</SubTitle>
        </Box>
        {currentProposal &&
          currentProposal.votes &&
          currentProposal.votes.map((vote) => (
            <DataRow>
              <Box flex>
                {vote.supports ? <ForIcon name="CheckmarkFilled" size={16} /> : <AgainstIcon name="Misuse" size={16} />}
                <StyledExternalLink href={`https://etherscan.io/address/${vote.voter}`}>
                  {shortenTokenAddress(vote.voter)}
                </StyledExternalLink>
              </Box>
              <StyledExternalLink href={networks[1].scanTxPath(vote.transaction_hash)}>
                <Data>
                  {formatVotingPower(+vote.voting_power)} ({vote.relative_power.toFixed(2)}%)
                </Data>
              </StyledExternalLink>
            </DataRow>
          ))}
      </VotesWrapper>
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
  padding-bottom: var(--spacing-3);
`

const VotesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
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
  font-weight: var(--semi-bold);
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
  margin-right: var(--spacing-2);
`

const AgainstIcon = styled(Icon)`
  color: var(--chart-red);
  margin-right: var(--spacing-2);
`

const formatVotingPower = (votingPower: number): string => {
  if (votingPower >= 1000000) {
    return `${(votingPower / 1000000).toFixed(2)}M`
  } else if (votingPower >= 1000) {
    return `${(votingPower / 1000).toFixed(2)}K`
  } else {
    return votingPower.toFixed(0)
  }
}

export default Voters
