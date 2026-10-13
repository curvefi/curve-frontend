import type { PoolQuery } from '@/stellar/queries/query-types'
import { WithdrawForm } from '@ui/features/pool-forms/withdraw/WithdrawForm'
import { useWithdrawForm } from './useWithdrawForm'
import { WithdrawActionInfoList } from './WithdrawActionInfoList'

export const WithdrawTab = (params: PoolQuery) => {
  const { params: queryParams, expectedLp, maximumLp, onSlippageChange, ...form } = useWithdrawForm(params)
  return (
    <WithdrawForm
      {...form}
      footer={
        <WithdrawActionInfoList
          params={queryParams}
          expectedLp={expectedLp}
          maximumLp={maximumLp}
          onSlippageChange={onSlippageChange}
        />
      }
    />
  )
}
