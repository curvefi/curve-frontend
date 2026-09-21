import type { PoolQuery } from '@/stellar/queries/root-keys'
import { DepositForm } from '@ui/features/pool-forms/deposit/DepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'
import { useDepositForm } from './useDepositForm'

export const DepositTab = (params: PoolQuery) => {
  const { params: queryParams, ...form } = useDepositForm(params)
  return <DepositForm {...form} footer={<DepositActionInfoList {...queryParams} />} />
}
