import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useStakeMutation } from '@/llamalend/mutations/stake.mutation'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import {
  type AssetsToSharesParams,
  type AssetsToSharesQuery,
  requireVault,
  type StakeForm,
  type StakeFormParams,
  stakeFormValidationSuite,
  userSupplyVaultAssetsValidationSuite,
} from '@/llamalend/queries/validation/supply.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { decimalEqual } from '@ui-kit/utils'
import { useMarketContext } from '../../market-context'
import { useVaultUserBalances } from './useVaultUserBalances'

const userDefaultValues = { stakeAssets: undefined, stakeShares: undefined }

const emptyStakeForm = (): StakeForm => ({
  ...userDefaultValues,
  maxStakeAssets: undefined,
})

const { useQuery: useStakeAssetsToShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, assets }: AssetsToSharesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'stake.assetsToShares', { assets }] as const,
  queryFn: async ({ marketId, assets }: AssetsToSharesQuery) =>
    (await requireVault(marketId).vault.convertToShares(assets)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: userSupplyVaultAssetsValidationSuite,
})

export const useStakeForm = <ChainId extends LlamaChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, controllerAddress, tokens, gaugeAddress, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network
  const marketHasGauge = !!gaugeAddress && gaugeAddress !== zeroAddress
  const marketAlert = useMarketAlert(chainId, controllerAddress, LlamaMarketType.Lend)

  const { borrowToken, collateralToken } = tokens

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress })
  const maxStakeAssets = {
    ...mapQuery(userBalances, d => d.depositedSharesAmount),
    fieldName: 'maxStakeAssets' as const,
  }
  const maxStakeShares = mapQuery(userBalances, d => d.depositedShares)

  const form = useForm<StakeForm>({
    validation: stakeFormValidationSuite,
    defaultValues: emptyStakeForm(),
  })

  const values = form.watchValues()
  const convertedStakeShares = useStakeAssetsToShares({ chainId, marketId, userAddress, assets: values.stakeAssets })
  const isMaxStake = values.stakeAssets && maxStakeAssets.data && decimalEqual(values.stakeAssets, maxStakeAssets.data)
  const stakeShares = isMaxStake ? maxStakeShares.data : convertedStakeShares.data

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): StakeFormParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        stakeAssets: values.stakeAssets,
        stakeShares,
      }),
      [chainId, marketId, stakeShares, userAddress, values.stakeAssets],
    ),
  )

  const {
    onSubmit: onStakeMutationSubmit,
    isPending: isStaking,
    error: stakeError,
  } = useStakeMutation({ marketId, network, onReset: () => form.reset(userDefaultValues), userAddress })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    onConfirm,
    onClose,
    isOpen,
  } = useFormLowSolvency({
    controllerAddress,
    marketType: LlamaMarketType.Lend,
    chainId,
    onSubmit: onStakeMutationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  useFormSync(form, { maxStakeAssets: maxStakeAssets.data })
  useFormSync(form, { stakeShares })

  const disabledAlert = (marketAlert?.isDepositDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert
  const { formState } = form
  const isPending = formState.isSubmitting || isStaking
  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || !marketId || isSolvencyLoading,
    onSubmit,
    isDisabled: !!disabledAlert || !formState.isValid || !marketHasGauge || isPending || isDebouncing,
    borrowToken,
    collateralToken,
    error: stakeError ?? solvencyError,
    max: maxStakeAssets,
    isApproved: useStakeIsApproved(params),
    hasGauge: marketHasGauge,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: { isOpen, onClose, onConfirm },
  }
}
