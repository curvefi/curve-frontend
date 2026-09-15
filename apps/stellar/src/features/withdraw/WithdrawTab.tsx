import type { PoolQuery } from '@/stellar/queries/root-keys'
import { WithdrawForm } from '@ui/features/pool-forms/withdraw/WithdrawForm'
import { useWithdrawForm } from './useWithdrawForm'
import { WithdrawFooter } from './WithdrawFooter'

export const WithdrawTab = (params: PoolQuery) => {
  const { params: queryParams, preview, ...form } = useWithdrawForm(params)
  return <WithdrawForm {...form} footer={<WithdrawFooter params={queryParams} preview={preview} />} />
}
