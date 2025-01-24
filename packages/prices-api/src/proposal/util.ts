import type { Proposal, ProposalStatus } from "./models";

export function getStatus(proposal: Proposal): ProposalStatus {
  if (proposal.executed) {
    return "executed";
  }

  if (proposal.end > new Date().getTime() / 1000) {
    return "active";
  }

  if (
    hasWon(proposal) &&
    hasReachedQuorum(proposal) &&
    hasReachedSupport(proposal)
  ) {
    return "passed";
  }

  return "denied";
}

export function hasReachedSupport(proposal: Proposal): boolean {
  return (
    proposal.votesFor >
    proposal.support * proposal.quorum * proposal.totalSupply
  );
}

export function hasReachedQuorum(proposal: Proposal): boolean {
  return proposal.votesFor > proposal.quorum * proposal.totalSupply;
}

export function hasWon(proposal: Proposal): boolean {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  return proposal.votesFor > totalVotes * 0.51;
}
