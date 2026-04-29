import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  useVaultMaxRedeemShares,
  useVaultMaxWithdrawAmount,
} from '@/llamalend/queries/supply/supply-withdraw-limits.query'
import type { WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import type { WithdrawForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalEqual } from '@ui-kit/utils'
import { updateForm, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from './useVaultUserBalances'

const getIsWithdrawFull = ({
  withdrawAmount,
  depositedShares,
  maxRedeemShares,
  maxWithdrawAmount,
}: {
  withdrawAmount: Decimal | undefined
  depositedShares: Decimal | undefined
  maxRedeemShares: Decimal | undefined
  maxWithdrawAmount: Decimal | undefined
}) =>
  withdrawAmount &&
  maxWithdrawAmount &&
  depositedShares &&
  maxRedeemShares &&
  // Only use redeem when the vault says the full deposited share balance is redeemable.
  decimalEqual(maxRedeemShares, depositedShares) &&
  // Flip to full mode once the entered amount reaches the current max withdrawable assets.
  decimalEqual(withdrawAmount, maxWithdrawAmount)

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
  const maxWithdrawAmount = useVaultMaxWithdrawAmount(params, enabled)
  const maxRedeemShares = useVaultMaxRedeemShares(params, enabled)
  const isFull = {
    data: getIsWithdrawFull({
      withdrawAmount: params.withdrawAmount ?? undefined,
      depositedShares: userBalances.data.depositedShares,
      maxRedeemShares: maxRedeemShares.data,
      maxWithdrawAmount: maxWithdrawAmount.data,
    }),
    ...combineQueryState(userBalances, maxWithdrawAmount, maxRedeemShares),
  }

  useFormSync(form, { maxWithdrawAmount: maxWithdrawAmount.data })
  useFormSync(form, { userVaultShares: userBalances.data.depositedShares })
  useEffect(() => (isFull.data == null ? undefined : updateForm(form, { isFull: isFull.data })), [form, isFull.data])

  return {
    maxWithdrawAmount: q(maxWithdrawAmount),
    maxStakedShares: mapQuery(userBalances, d => d.stakedShares),
    isFull,
  }
}
