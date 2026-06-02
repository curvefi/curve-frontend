export enum RecentRefuelsColumnId {
  Time = 'time',
  Refueler = 'refueler',
  LpShares = 'lpShares',
}

export const getTokenAmountColumnId = (tokenIndex: number): string => `tokenAmount_${tokenIndex}`
