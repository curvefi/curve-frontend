import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useUserBalances } from '@/llamalend/queries/user'
import type { WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import type { WithdrawForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm } from '@ui-kit/utils/react-form.utils'

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
  const userBalances = useUserBalances(params, enabled)
  const maxWithdrawAmount = mapQuery(userBalances, (d) => d.vaultSharesConverted)
  const isFull = useMemo(
    () => getIsWithdrawFull(params.withdrawAmount ?? undefined, maxWithdrawAmount.data),
    [maxWithdrawAmount.data, params.withdrawAmount],
  )

  useEffect(() => updateForm(form, { maxWithdrawAmount: maxWithdrawAmount.data }), [form, maxWithdrawAmount.data])
  useEffect(
    () => updateForm(form, { userVaultShares: userBalances.data?.vaultShares }),
    [form, userBalances.data?.vaultShares],
  )
  useEffect(() => updateForm(form, { isFull }), [form, isFull])

  return maxWithdrawAmount
}
