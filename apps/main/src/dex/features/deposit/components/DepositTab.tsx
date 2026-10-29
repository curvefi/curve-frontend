import type { TransferProps } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { AdvancedDepositForm } from '@ui/features/pool-forms/deposit/AdvancedDepositForm'
import { OneCoinDepositForm } from '@ui/features/pool-forms/deposit/OneCoinDepositForm'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'

const DepositTab = ({ maxSlippage, oneCoin }: TransferProps & { oneCoin: boolean }) => {
  const {
    pool: { data: pool },
  } = usePoolContext()
  const { params, ...form } = useDepositForm({ maxSlippage })
  const Component = oneCoin ? OneCoinDepositForm : AdvancedDepositForm
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

export const OneCoinDepositTab = (props: TransferProps) => <DepositTab {...props} oneCoin />

export const AdvancedDepositTab = (props: TransferProps) => <DepositTab {...props} oneCoin={false} />
