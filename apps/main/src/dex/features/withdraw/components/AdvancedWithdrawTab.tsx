import type { TransferProps } from '@/dex/components/PagePool/types'
import { AdvancedWithdrawForm } from '@ui/features/pool-forms/withdraw/AdvancedWithdrawForm'
import { useAdvancedWithdrawForm } from '../hooks/useAdvancedWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const AdvancedWithdrawTab = ({ maxSlippage }: TransferProps) => {
  const result = useAdvancedWithdrawForm({ maxSlippage })
  return <AdvancedWithdrawForm {...result} footer={<WithdrawActionInfoList {...result} />} />
}
