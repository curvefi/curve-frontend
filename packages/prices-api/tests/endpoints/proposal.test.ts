import * as proposal from '../../src/proposal'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getProposalSeed, getProposalVoteSeed, requestOptions } from '../seeds'

const proposalSeed = endpointSeed(getProposalSeed)
const proposalVoteSeed = endpointSeed(getProposalVoteSeed)

runEndpointCases('proposal', [
  endpointCase('getProposals', () => proposal.getProposals(1, 10, '', 'all', 'all', requestOptions)),
  endpointCase('getProposal', () =>
    proposal.getProposal(proposalSeed().id, proposalSeed().type, proposalSeed().txCreation, requestOptions),
  ),
  endpointCase('getUserProposalVotes', () =>
    proposal.getUserProposalVotes(proposalVoteSeed().user, 1, 10, requestOptions),
  ),
  endpointCase('getUserProposalVote', () =>
    proposal.getUserProposalVote(
      proposalVoteSeed().user,
      proposalVoteSeed().details.id,
      proposalVoteSeed().details.type,
      proposalVoteSeed().details.txCreation,
      requestOptions,
    ),
  ),
])
