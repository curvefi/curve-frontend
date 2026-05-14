import { fetchJson as fetch, FetchError } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getProposals(
  page: number,
  pagination = 10,
  search: string,
  type: Schema.ProposalType | 'all',
  status: Schema.ProposalStatus,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(
    `${host}/v1/dao/proposals?pagination=${pagination}&page=${page}&search_string=${search}&type_filter=${type}&status_filter=${status}`,
  )

  return Schema.getProposalsResponse.parse(resp)
}

export async function getProposal(
  proposalId: number,
  proposalType: Schema.ProposalType,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(
    `${host}/v1/dao/proposals/details/${proposalType}/${proposalId}${txHash ? `?tx_hash=${txHash}` : ''}`,
  )

  return Schema.getProposalDetailsResponse.parse(resp)
}

export async function getUserProposalVotes(user: string, page = 1, pagination = 100, options?: Options) {
  try {
    const host = getHost(options)
    const resp = await fetch(`${host}/v1/dao/proposals/votes/user/${user}?pagination=${pagination}&page=${page}`)

    return Schema.getUserProposalVotesResponse.parse(resp)
  } catch (err) {
    if (err instanceof FetchError) {
      return []
    } else throw err
  }
}

export async function getUserProposalVote(
  user: string,
  proposalId: number,
  proposalType: Schema.ProposalType,
  txHash?: string,
  options?: Options,
) {
  const pagination = 100
  let page = 1

  while (true) {
    const userVotes = await getUserProposalVotes(user, page, pagination, options)
    const userVote = userVotes.find(
      item =>
        item.proposal.id === proposalId &&
        item.proposal.type === proposalType &&
        (!txHash || item.proposal.txCreation === txHash || item.votes.some(vote => vote.txHash === txHash)),
    )

    if (userVote) {
      return userVote
    }

    if (userVotes.length < pagination) {
      throw new FetchError(404, `Fetch error 404 for user proposal vote: ${user}/${proposalType}/${proposalId}`)
    }

    page += 1
  }
}
