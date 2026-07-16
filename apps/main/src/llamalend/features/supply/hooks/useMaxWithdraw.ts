import { useCallback, useEffect } from 'react'
import {
  useVaultMaxRedeemShares,
  useVaultMaxWithdrawAmount,
} from '@/llamalend/queries/supply/supply-withdraw-limits.query'
import type { WithdrawForm, WithdrawParams } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { useFormSync } from '@ui-kit/features/forms'
import { useCombinedQueries } from '@ui-kit/lib'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalEqual } from '@ui-kit/utils'
import { useVaultUserBalances } from './useVaultUserBalances'

type VaultUserBalances = NonNullable<ReturnType<typeof useVaultUserBalances>['data']>

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
  maybes(
    [withdrawAmount, maxWithdrawAmount, depositedShares, maxRedeemShares],
    (withdrawAmount, maxWithdrawAmount, depositedShares, maxRedeemShares) =>
      // Only use redeem when the vault says the full deposited share balance is redeemable.
      decimalEqual(maxRedeemShares, depositedShares) &&
      // Flip to full mode once the entered amount reaches the current max withdrawable assets.
      decimalEqual(withdrawAmount, maxWithdrawAmount),
  )

export function useMaxWithdrawTokenValues<ChainId extends LlamaChainId>({
  params,
  form,
}: {
  params: WithdrawParams<ChainId>
  form: UseFormReturn<WithdrawForm>
}) {
  const { update: updateForm } = form
  const userBalances = useVaultUserBalances(params)
  const maxWithdrawAmount = useVaultMaxWithdrawAmount(params)
  const maxRedeemShares = useVaultMaxRedeemShares(params)

  const isFull = useCombinedQueries(
    [userBalances, maxWithdrawAmount, maxRedeemShares],
    useCallback(
      ({ depositedShares }: VaultUserBalances, maxWithdrawAmount: Decimal, maxRedeemShares: Decimal) =>
        getIsWithdrawFull({
          withdrawAmount: params.withdrawAmount ?? undefined,
          depositedShares,
          maxRedeemShares,
          maxWithdrawAmount,
        }),
      [params.withdrawAmount],
    ),
  )

  useFormSync(form, { maxWithdrawAmount: maxWithdrawAmount.data })
  useFormSync(form, { userVaultShares: userBalances.data?.depositedShares })
  useEffect(
    () => maybe(isFull.data, data => updateForm({ isFull: data }, { automated: true })),
    [isFull.data, updateForm],
  )

  return {
    maxWithdrawAmount: { ...q(maxWithdrawAmount), fieldName: 'maxWithdrawAmount' as const },
    maxStakedShares: mapQuery(userBalances, d => d.stakedShares),
    isFull,
  }
}
