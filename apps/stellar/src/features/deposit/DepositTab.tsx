import type { PoolQuery } from '@/stellar/queries/query-types'
import { depositForms, type DepositType } from '@ui/features/pool-forms/deposit/deposit-form.utils'
import { DepositActionInfoList } from './DepositActionInfoList'
import { useDepositForm } from './useDepositForm'

export const DepositTab = ({ type, ...params }: PoolQuery & { type: DepositType }) => {
  const { params: queryParams, onSlippageChange, ...form } = useDepositForm(params)
  const Component = depositForms[type]
  return <Component {...form} footer={<DepositActionInfoList {...queryParams} onSlippageChange={onSlippageChange} />} />
}
