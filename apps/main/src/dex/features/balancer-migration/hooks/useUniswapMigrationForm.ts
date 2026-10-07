import { useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimal, fromWei } from '@ui/lib/decimal'
import { calculatePriceImpact, shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { type CurveTarget, getCurveLpPriceUsd, getTargetGauge } from '../migration.utils'
import { type UniswapMigrationForm, uniswapMigrationFormValidationSuite } from '../migration.validation'
import { useMigrateUniswapMutation } from '../mutations/migrate-uniswap.mutation'
import { useClmmIsApproved, useClmmMigrationEstimateGas, useClmmMigrationRoute } from '../queries/clmm-migration.query'
import { LP_DECIMALS } from '../queries/migration-route.query'
import type { UniswapPositionRow } from './useUniswapPositionRows'

export const useUniswapMigrationForm = ({
  chainId,
  userAddress,
  position,
  target,
}: {
  chainId: number
  userAddress: Address
  position: UniswapPositionRow
  target: CurveTarget | undefined
}) => {
  const gaugeAddress = maybe(target, getTargetGauge)
  const form = useForm<UniswapMigrationForm>({
    validation: uniswapMigrationFormValidationSuite,
    defaultValues: { targetLpToken: target?.pool.lpTokenAddress, stake: false, slippage: SLIPPAGE.crypto.default },
  })
  useFormSync(form, { targetLpToken: target?.pool.lpTokenAddress })
  const values = form.watchValues()
  const tokenOut = values.stake && gaugeAddress ? gaugeAddress : values.targetLpToken

  const { positionManager, tokenId, liquidity, tokens } = position
  const params = useMemo(
    () => ({
      chainId,
      userAddress,
      positionManager,
      tokenId,
      liquidity,
      tokens: [tokens[0].address, tokens[1].address] as [Address, Address],
      tokenOut,
      slippage: values.slippage,
    }),
    [chainId, userAddress, positionManager, tokenId, liquidity, tokens, tokenOut, values.slippage],
  )
  const route = q(useClmmMigrationRoute(params))
  const expectedLp = mapQuery(route, ({ amountOut }) => fromWei(amountOut, LP_DECIMALS))
  const lpPriceUsd = maybe(target?.pool, getCurveLpPriceUsd)
  const expectedUsd = mapQuery(expectedLp, amount => maybe(lpPriceUsd, price => +amount * price))
  // Enso reports no price impact for bundles, so compare the USD value in and out.
  const tokenInUsd = decimal(position.totalUsd)
  const priceImpact = mapQuery(expectedUsd, usd => ({
    priceImpact: maybe(tokenInUsd, inUsd => maybe(decimal(usd), outUsd => calculatePriceImpact(outUsd, inUsd))),
    tokenInUsd,
  }))

  const {
    onSubmit,
    isPending: isMutating,
    error,
  } = useMigrateUniswapMutation({
    chainId,
    userAddress,
    position,
    poolName: position.name,
    onReset: () => form.reset({ stake: false }),
  })

  const { formState } = form
  const isPending = formState.isSubmitting || isMutating
  return {
    form,
    values,
    route,
    expectedLp,
    expectedUsd,
    priceImpact,
    gas: useClmmMigrationEstimateGas(params),
    isApproved: q(useClmmIsApproved(params)),
    onSubmit: form.handleSubmit(values => onSubmit({ ...values, tokenOut })),
    isPending,
    isDisabled: !formState.isValid || isPending || shouldBlockTransaction(priceImpact, false),
    error,
    formErrors: formState.visibleErrors,
  }
}
