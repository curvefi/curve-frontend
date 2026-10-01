import { useMemo } from 'react'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useBorrowClaimCrvMutation } from '@/llamalend/mutations/borrow-claim.mutation'
import { useBorrowClaimableCrv } from '@/llamalend/queries/borrow/borrow-claimable-crv.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useMarketContext } from '../../market-context'
import { CLAIM_TAB_COLUMNS } from '../../supply/components/columns'

const useClaimableTokens = <ChainId extends IChainId>({
  params,
  crvAddress,
}: {
  params: UserMarketParams<ChainId>
  crvAddress: Address | undefined
}) => {
  const { chainId } = params
  const { data: claimableCrv, isLoading: isClaimablesLoading, error: claimableCrvError } = useBorrowClaimableCrv(params)
  const {
    data: usdRates,
    isLoading: usdRateLoading,
    error: usdRateError,
  } = useTokenUsdRates({ chainId, tokenAddresses: notFalsy(crvAddress) })

  const claimableTokens = useMemo(
    () =>
      notFalsy(
        crvAddress &&
          claimableCrv &&
          Number(claimableCrv) > 0 && {
            amount: claimableCrv,
            token: crvAddress,
            symbol: MAINNET_CRV.symbol,
            notional: maybe(usdRates?.[crvAddress], usdRate => Number(claimableCrv) * usdRate),
          },
      ),
    [crvAddress, claimableCrv, usdRates],
  )

  return {
    claimableTokens,
    totalNotionals: claimableTokens[0]?.notional,
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
  const params = useMemo(
    (): UserMarketParams<ChainId> => ({ chainId, marketId, userAddress }),
    [chainId, marketId, userAddress],
  )
  const form = useForm({ defaultValues: {} })
  const {
    claimableTokens,
    totalNotionals,
    isClaimablesLoading,
    claimableCrvError,
    usdRateLoading,
    usdRateError,
    hasClaimableCrv,
  } = useClaimableTokens({ params, crvAddress: crvTokenAddress })

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
    isPending: isCrvPending,
    error: claimCrvError,
  } = useBorrowClaimCrvMutation({ marketId, network, userAddress, crvTokenAddress })
  const isPending = form.formState.isSubmitting || isCrvPending

  return {
    form,
    params,
    userAddress,
    table,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: isClaimablesLoading,
    isDisabled: [!hasClaimableCrv, !!claimableCrvError, claimableTokens.length === 0, isPending].some(Boolean),
    isPending,
    errors: notFalsy(usdRateError, claimableCrvError, claimCrvError),
  }
}
