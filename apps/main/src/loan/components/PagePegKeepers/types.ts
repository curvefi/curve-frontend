export type FormStatus = {
  isComplete: boolean
  isInProgress: boolean
  error: string
}

export type Details = {
  debt: string
  estCallerProfit: string
  debtCeiling: string
}

export type DetailsMapper = {
  [pegKeeperAddress: string]: Details
}
