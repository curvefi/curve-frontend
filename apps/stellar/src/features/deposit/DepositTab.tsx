import type { PoolQuery } from '@/stellar/queries/root-keys'
import { DepositForm } from '@ui/features/pool-forms/deposit/DepositForm'
import { DepositFooter } from './DepositFooter'
import { useDepositForm } from './useDepositForm'

export const DepositTab = (params: PoolQuery) => {
  const { params: queryParams, preview, ...form } = useDepositForm(params)
  return <DepositForm {...form} footer={<DepositFooter params={queryParams} {...preview} />} />
}
