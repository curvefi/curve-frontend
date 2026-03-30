import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import type { WithdrawForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from './useVaultUserBalances'

const getIsWithdrawFull = (withdrawAmount: Decimal | undefined, maxUserWithdrawAmount: Decimal | undefined) =>
  withdrawAmount && maxUserWithdrawAmount && new BigNumber(withdrawAmount).gte(new BigNumber(maxUserWithdrawAmount))

export function useMaxWithdrawTokenValues<ChainId extends LlamaChainId>(
  {
    params,
    form,
  }: {
    params: WithdrawParams<ChainId>
    form: UseFormReturn<WithdrawForm>
  },
  enabled?: boolean,
) {
  const userBalances = useVaultUserBalances(params, enabled)
  const maxWithdrawAmount = mapQuery(userBalances, (d) => d.depositedSharesAmount)
  const isFull = mapQuery(maxWithdrawAmount, (maxAmountQuery) =>
    getIsWithdrawFull(params.withdrawAmount ?? undefined, maxAmountQuery),
  )

  useFormSync(form, { maxWithdrawAmount: maxWithdrawAmount.data })
  useFormSync(form, { userVaultShares: userBalances.data.depositedShares })
  useEffect(() => (isFull.data == null ? undefined : updateForm(form, { isFull: isFull.data })), [form, isFull.data])

  return { maxWithdrawAmount, maxStakedShares: mapQuery(userBalances, (d) => d.stakedShares), isFull }
}
