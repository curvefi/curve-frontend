import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection, useReadContract } from 'wagmi'
import { ABI_VECRV } from '@/dao/abis/vecrv'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { MetricsTitle } from '@/dao/components/MetricsComp'
import { CONTRACT_VECRV } from '@/dao/constants'
import { useProposalPricesApiQuery, invalidateProposalPricesApi } from '@/dao/entities/proposal-prices-api'
import { useProposalsMapperQuery } from '@/dao/entities/proposals-mapper'
import type { ProposalUrlParams } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { ProposalType } from '@curvefi/prices-api/proposal/models'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { breakpoints } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { Chain, copyToClipboard } from '@ui-kit/utils'
import { BackButton } from '../BackButton'
import { ProposalVoteStatusBox } from '../ProposalVoteStatusBox'
import { UserBox } from '../UserBox'
import { VoteDialog } from '../UserBox/VoteDialog'
import { Script } from './components/Script'
import { ProposalHeader } from './ProposalHeader'
import { ProposalInformation } from './ProposalInformation'
import { Voters } from './Voters'

export const Proposal = ({ proposalId: rProposalId }: ProposalUrlParams) => {
  const [voteId, voteType] = rProposalId.split('-') as [string, ProposalType]
  const proposalType = voteType.toLowerCase() as ProposalType
  const { address: userAddress } = useConnection()

  const {
    data: proposalsMapper,
    isLoading: proposalsListLoading,
    isSuccess: proposalsListSuccess,
  } = useProposalsMapperQuery({})
  const {
    data: pricesProposal,
    isLoading: pricesProposalLoading,
    isError: pricesProposalError,
    isSuccess: pricesProposalSuccess,
  } = useProposalPricesApiQuery({ proposalId: +voteId, proposalType: proposalType })
  const proposal = proposalsMapper?.[rProposalId] ?? null

  const isLoading = pricesProposalLoading || proposalsListLoading
  const isFetched = pricesProposalSuccess && proposalsListSuccess

  const activeProposal = useMemo(
    () =>
      proposal?.status === 'Active'
        ? {
            active: true,
            startTimestamp: proposal?.timestamp,
            endTimestamp: proposal?.timestamp + 604800,
          }
        : undefined,
    [proposal?.status, proposal?.timestamp],
  )

  const { data: votingPower, isLoading: snapshotVeCrvLoading } = useReadContract({
    chainId: Chain.Ethereum,
    abi: ABI_VECRV,
    address: CONTRACT_VECRV,
    functionName: 'balanceOfAt',
    args: [userAddress!, BigInt(proposal!.block)],
    query: {
      enabled: !!userAddress && !!proposal,
      select: (vecrv) => Number(vecrv) / 1e18,
    },
  })

  const snapshotVeCrv = useMemo(
    () =>
      proposal != null && votingPower != null
        ? {
            value: votingPower,
            blockNumber: proposal.block,
          }
        : undefined,
    [proposal, votingPower],
  )

  return (
    <Wrapper>
      <BackButton path={getEthPath(DAO_ROUTES.PAGE_PROPOSALS)} label={t`Back to proposals`} />
      <Box flex>
        <Box flex flexDirection="column" flexGap="var(--spacing-1)" style={{ width: '100%' }}>
          <ProposalContainer variant="secondary">
            <ProposalHeader
              proposal={proposal}
              loading={proposalsListLoading}
              voteId={voteId}
              proposalType={proposalType}
            />
            {pricesProposalError && !isLoading && (
              <ErrorWrapper>
                <ErrorMessage
                  message={t`Error loading proposal data`}
                  onClick={() => invalidateProposalPricesApi({ proposalId: +voteId, proposalType: proposalType })}
                />
              </ErrorWrapper>
            )}
            {isLoading && (
              <StyledSpinnerWrapper>
                <Spinner />
              </StyledSpinnerWrapper>
            )}
            {isFetched && (
              <>
                <MetaData>
                  <Box flex flexJustifyContent="space-between" flexAlignItems="end">
                    <MetadataTitle>{t`Metadata`}</MetadataTitle>
                    <Tooltip tooltip={t`Copy to clipboard`} minWidth="135px">
                      <StyledCopyButton size="medium" onClick={() => copyToClipboard(proposal?.metadata ?? '')}>
                        {t`Raw IPFS`}
                        <Icon name="Copy" size={16} />
                      </StyledCopyButton>
                    </Tooltip>
                  </Box>
                  <MetaDataParaphraph>{proposal?.metadata}</MetaDataParaphraph>
                </MetaData>
                {pricesProposal && <Script script={pricesProposal?.script} />}

                {/* Votes and User Box inline on small screens */}
                <VotesAndUserBox>
                  {proposal && (
                    <Box padding="0 var(--spacing-3)">
                      <ProposalVoteStatusBox proposalData={proposal} />
                    </Box>
                  )}
                </VotesAndUserBox>
              </>
            )}
            {proposal && !isLoading && proposal?.voteCount !== 0 && (
              <Voters
                voteId={voteId}
                totalVotes={proposal?.votesFor + proposal?.votesAgainst}
                proposalType={proposalType}
              />
            )}
            <ProposalInformationWrapper>
              <ProposalInformation proposal={proposal} />
            </ProposalInformationWrapper>
          </ProposalContainer>
          <UserSmScreenWrapper variant="secondary">
            <UserBox votingPower={snapshotVeCrv} snapshotVotingPower activeProposal={activeProposal}>
              {proposal && userAddress && snapshotVeCrv != null && !snapshotVeCrvLoading && (
                <VoteDialog
                  userAddress={userAddress}
                  snapshotVotingPower
                  activeProposal={activeProposal}
                  votingPower={snapshotVeCrv}
                  proposalId={+voteId}
                  proposalType={proposalType}
                />
              )}
            </UserBox>
          </UserSmScreenWrapper>
        </Box>

        <SecondColumnBox display="flex" flexColumn flexGap={'var(--spacing-1)'} margin="0 0 auto var(--spacing-1)">
          <Box variant="secondary">
            <UserBox
              votingPower={snapshotVeCrv}
              snapshotVotingPower
              activeProposal={
                proposal?.status === 'Active'
                  ? { active: true, startTimestamp: proposal?.timestamp, endTimestamp: proposal?.timestamp + 604800 }
                  : undefined
              }
            >
              {proposal && userAddress && snapshotVeCrv != null && !snapshotVeCrvLoading && (
                <VoteDialog
                  userAddress={userAddress}
                  snapshotVotingPower
                  activeProposal={activeProposal}
                  votingPower={snapshotVeCrv}
                  proposalId={+voteId}
                  proposalType={proposalType}
                />
              )}
            </UserBox>
          </Box>
          {proposal && (
            <>
              <VotesWrapper variant="secondary">
                <ProposalVoteStatusBox proposalData={proposal} />
              </VotesWrapper>
              <Box variant="secondary" padding="var(--spacing-3)">
                <ProposalInformation proposal={proposal} />
              </Box>
            </>
          )}
        </SecondColumnBox>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const ProposalContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: var(--spacing-4);
  margin-bottom: auto;
  padding-bottom: var(--spacing-4);
`

const SecondColumnBox = styled(Box)`
  width: 22.875rem;
  @media (max-width: 55.625rem) {
    display: none;
  }
`

const MetadataTitle = styled(MetricsTitle)`
  align-self: center;
  @media (min-width: ${breakpoints.sm}rem) {
    align-self: flex-end;
  }
`

const VotesAndUserBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const UserSmScreenWrapper = styled(Box)`
  border-top: 1px solid var(--border-color);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const ProposalInformationWrapper = styled.div`
  padding: 0 var(--spacing-3);
  @media (min-width: 55.625rem) {
    display: none;
  }
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 39.75rem;
  max-width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4);
`

const MetaData = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-3);
`

const MetaDataParaphraph = styled.p`
  font-size: var(--font-size-2);
  line-height: 1.5;
  max-width: 40rem;
  font-weight: var(--semi-bold);
  white-space: pre-line;
  word-break: break-word;
`

const VotesWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  min-width: 20rem;
  gap: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  width: 100%;
  margin-bottom: var(--spacing-4);
`

const StyledCopyButton = styled(IconButton)`
  align-items: end;
  display: flex;
  gap: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  padding: 0 var(--spacing-1);
  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;
  min-height: var(--height-x-small);
  min-width: var(--height-x-small);
  &:hover {
    color: var(--button_icon--hover--color);
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`
