import { useMemo } from 'react'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useUnstakeMutation } from '@/llamalend/mutations/unstake.mutation'
import {
  type AssetsToSharesParams,
  type AssetsToSharesQuery,
  requireVault,
  type UnstakeForm,
  type UnstakeFormParams,
  unstakeFormValidationSuite,
  userSupplyVaultAssetsValidationSuite,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { useFormSync, useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { decimalEqual } from '@ui-kit/utils'
import { useMarketContext } from '../../market-context'
import { useVaultUserBalances } from './useVaultUserBalances'

const userDefaultValues = { unstakeAssets: undefined, unstakeShares: undefined }

const emptyUnstakeForm = (): UnstakeForm => ({
  ...userDefaultValues,
  maxUnstakeAssets: undefined,
})

const { useQuery: useUnstakeAssetsToShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, assets }: AssetsToSharesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'unstake.assetsToShares', { assets }] as const,
  queryFn: async ({ marketId, assets }: AssetsToSharesQuery) =>
    (await requireVault(marketId).vault.convertToShares(assets)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: userSupplyVaultAssetsValidationSuite,
})

export const useUnstakeForm = <ChainId extends LlamaChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, tokens, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network

  const { borrowToken, collateralToken } = tokens

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress })
  const maxUnstakeAssets = {
    ...mapQuery(userBalances, d => d.stakedSharesAmount),
    fieldName: 'maxUnstakeAssets' as const,
  }
  const maxUnstakeShares = mapQuery(userBalances, d => d.stakedShares)

  const form = useForm<UnstakeForm>({
    validation: unstakeFormValidationSuite,
    defaultValues: emptyUnstakeForm(),
  })

  const values = form.watchValues()
  const convertedUnstakeShares = useUnstakeAssetsToShares({
    chainId,
    marketId,
    userAddress,
    assets: values.unstakeAssets,
  })
  const isMaxUnstake =
    values.unstakeAssets && maxUnstakeAssets.data && decimalEqual(values.unstakeAssets, maxUnstakeAssets.data)
  const unstakeShares = isMaxUnstake ? maxUnstakeShares.data : convertedUnstakeShares.data

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): UnstakeFormParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        unstakeAssets: values.unstakeAssets,
        unstakeShares,
      }),
      [chainId, marketId, unstakeShares, userAddress, values.unstakeAssets],
    ),
  )

  const {
    onSubmit,
    isPending: isUnstaking,
    error: unstakeError,
  } = useUnstakeMutation({
    marketId,
    network,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const { formState } = form

  useFormSync(form, { maxUnstakeAssets: maxUnstakeAssets.data })
  useFormSync(form, { unstakeShares })

  const isPending = formState.isSubmitting || isUnstaking
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing,
    borrowToken,
    collateralToken,
    unstakeError,
    max: maxUnstakeAssets,
    formErrors: formState.visibleErrors,
  }
}
