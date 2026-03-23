import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import type { WithdrawForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm } from '@ui-kit/utils/react-form.utils'
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
  const isFull = useMemo(
    () => getIsWithdrawFull(params.withdrawAmount ?? undefined, maxWithdrawAmount.data),
    [maxWithdrawAmount.data, params.withdrawAmount],
  )

  useEffect(() => updateForm(form, { maxWithdrawAmount: maxWithdrawAmount.data }), [form, maxWithdrawAmount.data])
  useEffect(
    () => updateForm(form, { userVaultShares: userBalances.data.depositedShares }),
    [form, userBalances.data.depositedShares],
  )
  useEffect(() => updateForm(form, { isFull }), [form, isFull])

  return { maxWithdrawAmount, maxStakedShares: mapQuery(userBalances, (d) => d.stakedShares) }
}
