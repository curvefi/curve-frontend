// Max possible loan at N=4, derived from the market amplification and loan discount.
export const getMaxLtv = (amplification: number | undefined, loanDiscount: string | undefined) => {
  if (amplification == null || loanDiscount == null) return
  return ((amplification - 1) / amplification) ** 2 * (1 - +loanDiscount / 100) * 100
}
