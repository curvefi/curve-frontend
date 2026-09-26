import type { TransferProps } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { DepositForm as SharedDepositForm } from '@ui/features/pool-forms/deposit/DepositForm'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositActionInfoList } from './DepositActionInfoList'

export const DepositForm = ({ maxSlippage }: TransferProps) => {
  const { pool } = usePoolContext()
  const { params, ...form } = useDepositForm({ maxSlippage })
  return (
    <SharedDepositForm
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
