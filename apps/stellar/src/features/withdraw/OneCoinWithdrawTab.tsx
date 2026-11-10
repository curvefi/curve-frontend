import type { PoolQuery } from '@/stellar/queries/query-types'
import { OneCoinWithdrawForm } from '@ui/features/pool-forms/withdraw/OneCoinWithdrawForm'
import { useOneCoinWithdrawForm } from './useOneCoinWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const OneCoinWithdrawTab = (params: PoolQuery) => {
  const result = useOneCoinWithdrawForm(params)
  return <OneCoinWithdrawForm {...result} footer={<WithdrawActionInfoList {...result} />} />
}
