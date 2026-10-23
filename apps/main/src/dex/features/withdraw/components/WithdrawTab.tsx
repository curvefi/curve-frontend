import type { TransferProps } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { WithdrawForm } from '@ui/features/pool-forms/withdraw/WithdrawForm'
import { useWithdrawForm } from '../hooks/useWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const WithdrawTab = ({ maxSlippage }: TransferProps) => {
  const {
    pool: { data: pool },
  } = usePoolContext()
  const { params, expectedLp, maximumLp, ...form } = useWithdrawForm({ maxSlippage })
  return (
    <WithdrawForm
      {...form}
      footer={
        <WithdrawActionInfoList
          form={form.form}
          params={params}
          expectedLp={expectedLp}
          maximumLp={maximumLp}
          lpBalance={form.lpBalance}
          slippageType={getSlippageType(pool)}
        />
      }
    />
  )
}
