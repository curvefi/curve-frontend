import type { TransferProps } from '@/dex/components/PagePool/types'
import { OneCoinWithdrawForm } from '@ui/features/pool-forms/withdraw/OneCoinWithdrawForm'
import { useOneCoinWithdrawForm } from '../hooks/useOneCoinWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const OneCoinWithdrawTab = ({ maxSlippage }: Pick<TransferProps, 'maxSlippage'>) => {
  const result = useOneCoinWithdrawForm({ maxSlippage })
  return <OneCoinWithdrawForm {...result} footer={<WithdrawActionInfoList {...result} />} />
}
