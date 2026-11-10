import type { PoolQuery } from '@/stellar/queries/query-types'
import { AdvancedWithdrawForm } from '@ui/features/pool-forms/withdraw/AdvancedWithdrawForm'
import { useAdvancedWithdrawForm } from './useAdvancedWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const AdvancedWithdrawTab = (params: PoolQuery) => {
  const result = useAdvancedWithdrawForm(params)
  return <AdvancedWithdrawForm {...result} footer={<WithdrawActionInfoList {...result} />} />
}
