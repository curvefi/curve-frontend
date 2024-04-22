export const formatVotingPower = (votingPower: number): string => {
  if (votingPower >= 1000000) {
    return `${(votingPower / 1000000).toFixed(2)}M`
  } else if (votingPower >= 1000) {
    return `${(votingPower / 1000).toFixed(2)}K`
  } else {
    return votingPower.toFixed(0)
  }
}
