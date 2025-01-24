import { getHost, type Options } from "..";
import { fetchJson as fetch, FetchError } from "../fetch";
import type * as Responses from "./responses";
import type * as Models from "./models";
import * as Parsers from "./parsers";

export async function getProposals(
  page: number,
  search: string,
  type: Models.ProposalType,
  status: Models.ProposalStatus,
  options?: Options
) {
  const host = await getHost(options);
  const resp = await fetch<Responses.GetProposalsResponse>(
    `${host}/v1/dao/proposals?pagination=10&page=${page}&search_string=${search}&type_filter=${type}&status_filter=${status}`
  );

  return {
    proposals: resp.proposals.map(Parsers.parseProposal),
    count: resp.count,
  };
}

export async function getProposal(
  proposalId: number,
  proposalType: Models.ProposalType,
  options?: Options
) {
  const host = await getHost(options);
  const resp = await fetch<Responses.GetProposalDetailsResponse>(
    `${host}/v1/dao/proposals/details/${proposalType}/${proposalId}`
  );

  return Parsers.parseProposalDetails(resp);
}

export async function getUserProposalVotes(user: string, options?: Options) {
  try {
    const host = await getHost(options);
    const resp = await fetch<Responses.GetUserProposalVotes>(
      `${host}/v1/dao/proposals/votes/user/${user}?pagination=100&page=1`
    );

    return resp.data.map(Parsers.parseUserProposalVote);
  } catch (err) {
    if (err instanceof FetchError) {
      return [];
    } else throw err;
  }
}
