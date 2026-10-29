import type { PoolQuery } from '@/stellar/queries/query-types'
import { AdvancedDepositForm } from '@ui/features/pool-forms/deposit/AdvancedDepositForm'
import { OneCoinDepositForm } from '@ui/features/pool-forms/deposit/OneCoinDepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'
import { useDepositForm } from './useDepositForm'

const DepositTab = ({ oneCoin, ...params }: PoolQuery & { oneCoin: boolean }) => {
  const { params: queryParams, onSlippageChange, ...form } = useDepositForm(params)
  const Component = oneCoin ? OneCoinDepositForm : AdvancedDepositForm
  return <Component {...form} footer={<DepositActionInfoList {...queryParams} onSlippageChange={onSlippageChange} />} />
}

export const OneCoinDepositTab = (params: PoolQuery) => <DepositTab {...params} oneCoin />

export const AdvancedDepositTab = (params: PoolQuery) => <DepositTab {...params} oneCoin={false} />
