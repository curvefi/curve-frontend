import { FormValues } from '@/components/PageLoanManage/LoanSwap/types'

export function getItemsName(llamma: Llamma, formValues: FormValues) {
  return {
    item1Name: llamma.coins[formValues.item1Key],
    item2Name: llamma.coins[formValues.item2Key],
  }
}
