import type { TransferProps } from '@/dex/components/PagePool/types'
import { depositForms, type DepositType } from '@ui/features/pool-forms/deposit/deposit-form.utils'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'

export const DepositTab = ({ maxSlippage, type }: TransferProps & { type: DepositType }) => {
  const { params, form, ...props } = useDepositForm({ maxSlippage })
  const Component = depositForms[type]
  return <Component {...props} form={form} footer={<DepositActionInfoList form={form} params={params} />} />
}

export const OneCoinDepositTab = (props: TransferProps) => <DepositTab {...props} type="one-coin" />
export const AdvancedDepositTab = (props: TransferProps) => <DepositTab {...props} type="advanced" />
