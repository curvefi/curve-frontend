import { fetchJson as fetch, FetchError } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options } from '..'
import type * as Models from './models'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getProposals(
  page: number,
  pagination: number = 10,
  search: string,
  type: Models.ProposalType | 'all',
  status: Models.ProposalStatus,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetProposalsResponse>(
    `${host}/v1/dao/proposals?pagination=${pagination}&page=${page}&search_string=${search}&type_filter=${type}&status_filter=${status}`,
  )

  return {
    proposals: resp.proposals.map(Parsers.parseProposal),
    count: resp.count,
  }
}

export async function getProposal(
  proposalId: number,
  proposalType: Models.ProposalType,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetProposalDetailsResponse>(
    `${host}/v1/dao/proposals/details/${proposalType}/${proposalId}${txHash ? `?tx_hash=${txHash}` : ''}`,
  )

  return Parsers.parseProposalDetails(resp)
}

export async function getUserProposalVotes(
  user: string,
  page: number = 1,
  pagination: number = 100,
  options?: Options,
) {
  try {
    const host = getHost(options)
    const resp = await fetch<Responses.GetUserProposalVotes>(
      `${host}/v1/dao/proposals/votes/user/${user}?pagination=${pagination}&page=${page}`,
    )

    return resp.data.map(Parsers.parseUserProposalVote)
  } catch (err) {
    if (err instanceof FetchError) {
      return []
    } else throw err
  }
}

export async function getUserProposalVote(
  user: string,
  proposalId: number,
  proposalType: Models.ProposalType,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserProposalVote>(
    `${host}/v1/dao/proposals/votes/user/${user}/${proposalType}/${proposalId}${txHash ? `?tx_hash=${txHash}` : ''}`,
  )

  return Parsers.parseUserProposalVote(resp)
}
