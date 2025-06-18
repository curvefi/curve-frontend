import { FormValues } from '@/loan/components/PageLoanManage/LoanSwap/types'
import { Llamma } from '@/loan/types/loan.types'

export function getItemsName(llamma: Llamma, formValues: FormValues) {
  return {
    item1Name: llamma.coins[formValues.item1Key],
    item2Name: llamma.coins[formValues.item2Key],
  }
}
