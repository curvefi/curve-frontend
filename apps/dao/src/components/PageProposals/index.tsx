import type { Params } from 'react-router'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Proposal from './Proposal'
import Box from '@/ui/Box'
import SearchInput from '@/ui/SearchInput'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Proposals = ({
  rChainId,
  params,
  curve,
}: {
  rChainId: ChainId
  params: Readonly<Params<string>>
  curve: CurveApi | null
}) => {
  const { proposalsLoading, proposals } = useStore((state) => state.daoProposals)

  const tempProposal: ProposalData[] = [
    {
      creator: '0x0fc59c9c998537c940a9dfc7dacde533a9c496fe',
      executed: false,
      ipfsMetadata: 'ipfs:QmRuJpbQVYEh5Myjn35tCX1MtmmtVPpYo3Pxv8kok6GSBi',
      metadata: 'Add a gauge for the following pool: https://gov.curve.fi/t/proposal-to-add-eeth-rsweth-gauge/9924',
      minAcceptQuorum: '300000000000000000',
      snapshotBlock: 19125887,
      startDate: 1706697143,
      supportRequired: '510000000000000000',
      totalSupply: '647386881479492571972543950',
      voteCount: 1,
      voteId: 596,
      voteType: 'OWNERSHIP',
      votesAgainst: '0',
      votesFor: '273493296797183379082898042',
    },
  ]

  return (
    <ProposalsContainer variant="primary">
      <PageTitle>DAO Proposals</PageTitle>
      <SearchInput id="inpSearchProposals" placeholder={t`Search`} />
      <Box>
        {proposalsLoading ? (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        ) : (
          tempProposal.map((proposal) => <Proposal {...proposal} key={proposal.voteId} />)
        )}
      </Box>
    </ProposalsContainer>
  )
}

const ProposalsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  max-width: 60rem;
  margin: var(--spacing-5) auto;
  row-gap: var(--spacing-3);
`

const PageTitle = styled.h2``

export default Proposals
