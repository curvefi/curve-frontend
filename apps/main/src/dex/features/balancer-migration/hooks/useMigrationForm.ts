import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimal } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { BalancerPosition } from '../api/balancer.api'
import type { CurveTarget } from '../migration.utils'
import { type MigrationForm, migrationFormValidationSuite } from '../migration.validation'
import { useMigrateMutation } from '../mutations/migrate.mutation'
import { useMigrationIsApproved, useMigrationRoute } from '../queries/migration-route.query'

const userDefaultValues = { amount: undefined }

export const useMigrationForm = ({
  chainId,
  position,
  targets,
}: {
  chainId: number
  position: BalancerPosition
  targets: CurveTarget[]
}) => {
  const { address: userAddress } = useConnection()
  const tokenIn = position.address
  const maxAmount = useTokenBalance({ chainId, userAddress, tokenAddress: tokenIn })
  const form = useForm<MigrationForm>({
    validation: migrationFormValidationSuite,
    defaultValues: {
      ...userDefaultValues,
      maxAmount: undefined,
      targetLpToken: targets[0]?.pool.lpTokenAddress,
      slippage: SLIPPAGE.crypto.default,
    },
  })
  useFormSync(form, { maxAmount: maxAmount.data })
  const values = form.watchValues()

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
        chainId,
        userAddress,
        tokenIn,
        tokenOut: values.targetLpToken,
        amount: values.amount,
        slippage: values.slippage,
      }),
      [chainId, userAddress, tokenIn, values.targetLpToken, values.amount, values.slippage],
    ),
    userDefaultValues,
  )

  const route = q(useMigrationRoute(params))
  const { walletBalance, walletBalanceUsd } = position.userBalance
  const lpPriceUsd = +walletBalance ? walletBalanceUsd / +walletBalance : undefined
  const priceImpact = mapQuery(route, ({ priceImpact }) =>
    maybe(priceImpact, bps => ({
      priceImpact: decimal(bps / 100), // Enso reports basis points
      tokenInUsd: decimal(lpPriceUsd && +(params.amount ?? 0) * lpPriceUsd),
    })),
  )

  const {
    onSubmit,
    isPending: isMutating,
    error,
  } = useMigrateMutation({
    chainId,
    userAddress,
    tokenIn,
    poolName: position.name,
    onReset: () => form.reset(userDefaultValues),
  })

  const { formState } = form
  const isPending = formState.isSubmitting || isMutating
  return {
    form,
    values,
    params,
    route,
    priceImpact,
    maxAmount: q(maxAmount),
    lpPriceUsd,
    userAddress,
    isApproved: q(useMigrationIsApproved(params)),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled: !formState.isValid || isPending || isDebouncing || shouldBlockTransaction(priceImpact, false),
    error,
    formErrors: formState.visibleErrors,
  }
}
