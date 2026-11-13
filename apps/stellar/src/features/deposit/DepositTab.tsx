import type { PoolQuery } from '@/stellar/queries/query-types'
import { depositForms, type DepositType } from '@ui/features/pool-forms/deposit/deposit-form.utils'
import { DepositActionInfoList } from './DepositActionInfoList'
import { useDepositForm } from './useDepositForm'

export const DepositTab = ({ type, ...params }: PoolQuery & { type: DepositType }) => {
  const result = useDepositForm(params)
  const Component = depositForms[type]
  return <Component {...result} footer={<DepositActionInfoList {...result} />} />
}
