import type { TransferProps } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { depositForms, type DepositType } from '@ui/features/pool-forms/deposit/deposit-form.utils'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'

export const DepositTab = ({ maxSlippage, type }: TransferProps & { type: DepositType }) => {
  const {
    pool: { data: pool },
  } = usePoolContext()
  const { params, ...form } = useDepositForm({ maxSlippage })
  const Component = depositForms[type]
  return (
    <Component
      {...form}
      footer={
        <DepositActionInfoList
          form={form.form}
          params={params}
          isSeed={form.isSeed}
          slippageType={getSlippageType(pool)}
        />
      }
    />
  )
}

export const OneCoinDepositTab = (props: TransferProps) => <DepositTab {...props} type="one-coin" />
export const AdvancedDepositTab = (props: TransferProps) => <DepositTab {...props} type="advanced" />
