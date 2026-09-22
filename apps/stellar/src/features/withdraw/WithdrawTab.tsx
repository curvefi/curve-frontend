import type { PoolQuery } from '@/stellar/queries/root-keys'
import { WithdrawForm } from '@ui/features/pool-forms/withdraw/WithdrawForm'
import { useWithdrawForm } from './useWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const WithdrawTab = (params: PoolQuery) => {
  const { params: queryParams, onSlippageChange, ...form } = useWithdrawForm(params)
  return (
    <WithdrawForm {...form} footer={<WithdrawActionInfoList {...queryParams} onSlippageChange={onSlippageChange} />} />
  )
}
