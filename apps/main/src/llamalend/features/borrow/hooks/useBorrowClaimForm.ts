import { noop, sumBy } from 'lodash'
import { useMemo } from 'react'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useBorrowClaimCrvMutation } from '@/llamalend/mutations/borrow-claim.mutation'
import { useBorrowClaimableCrv } from '@/llamalend/queries/borrow/borrow-claimable-crv.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, notFalsy, recordValues } from '@primitives/objects.utils'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { combineQueryState } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { useMarketContext } from '../../market-context'
import { CLAIM_TAB_COLUMNS } from '../../supply/components/columns/column.definitions'

type BorrowClaimComputed = { claimableCrv: Decimal }

const useClaimableTokens = <ChainId extends IChainId>({
  params,
  crvAddress,
}: {
  params: UserMarketParams<ChainId>
  crvAddress: Address | undefined
}) => {
  const { chainId } = params
  const claimables = useBorrowClaimableCrv(params)
  const { data: claimableCrv, isLoading: isClaimablesLoading, error: claimableCrvError } = claimables
  const usdRates = useTokenUsdRates({ chainId, tokenAddresses: notFalsy(crvAddress) })
  const { isLoading: usdRateLoading, error: usdRateError } = combineQueryState(...recordValues(usdRates))

  const claimableTokens = useMemo(
    () =>
      notFalsy(
        crvAddress &&
          claimableCrv &&
          Number(claimableCrv) > 0 && {
            amount: claimableCrv,
            token: crvAddress,
            symbol: MAINNET_CRV.symbol,
            notional: maybe(usdRates[crvAddress]?.data, usdRate => Number(claimableCrv) * usdRate),
          },
      ),
    [crvAddress, claimableCrv, usdRates],
  )

  return {
    claimableTokens,
    totalNotionals: sumBy(claimableTokens, 'notional'),
    claimables,
    isClaimablesLoading,
    claimableCrvError,
    usdRateLoading,
    usdRateError,
    hasClaimableCrv: Number(claimableCrv) > 0,
  }
}

export const useBorrowClaimForm = <ChainId extends IChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, crvTokenAddress, userAddress } = useMarketContext<ChainId>()
  const { chainId, blockchainId } = network
  const inputs = useFormValues({ defaultValues: {}, context: { chainId, marketId, userAddress } })
  const {
    claimableTokens,
    totalNotionals,
    claimables,
    isClaimablesLoading,
    claimableCrvError,
    usdRateLoading,
    usdRateError,
    hasClaimableCrv,
  } = useClaimableTokens({ params: inputs.params, crvAddress: crvTokenAddress })

  const table = useCurveTable({
    columns: CLAIM_TAB_COLUMNS,
    query: q({
      data: useMemo(
        () => claimableTokens.map(token => ({ ...token, blockchainId, isLoading: usdRateLoading })),
        [claimableTokens, blockchainId, usdRateLoading],
      ),
      isLoading: isClaimablesLoading,
      error: claimableCrvError,
    }),
  })

  const {
    onSubmit,
    isPending,
    error: claimCrvError,
  } = useBorrowClaimCrvMutation({ marketId, network, userAddress, crvTokenAddress })
  const form = useFormValidation<object, UserMarketParams<ChainId>, BorrowClaimComputed>({
    inputs,
    validation: useMemo(() => createValidationSuite<BorrowClaimComputed>(noop), []),
    computed: { claimableCrv: claimables },
    isSubmitting: isPending,
    disabled: !hasClaimableCrv || !!claimableCrvError || claimableTokens.length === 0,
  })

  return {
    form,
    params: form.params,
    userAddress,
    table,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    isClaimablesLoading,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.isLoading,
    isDisabled: form.isDisabled,
    isPending,
    error: claimCrvError ?? form.error ?? usdRateError,
  }
}
