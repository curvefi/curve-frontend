export type BorrowMaxReceiveForm = {
  userCollateral: number | undefined
  userBorrowed: number | undefined
  range: number
}
export type BorrowForm = BorrowMaxReceiveForm & {
  debt: number | undefined
  leverage: number | undefined
}
