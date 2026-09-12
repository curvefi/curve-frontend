import type { PoolQuery } from '@/queries/root-keys'
import { DepositForm } from '@ui/features/forms/deposit/DepositForm'
import { DepositFooter } from './DepositFooter'
import { useDepositForm } from './useDepositForm'

export const DepositTab = (params: PoolQuery) => {
  const { params: queryParams, preview, ...form } = useDepositForm(params)
  return <DepositForm {...form} footer={<DepositFooter params={queryParams} preview={preview} />} />
}
