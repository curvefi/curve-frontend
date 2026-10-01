import { useMemo } from 'react'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useBorrowClaimCrvMutation } from '@/llamalend/mutations/borrow-claim.mutation'
import { useBorrowClaimableCrv } from '@/llamalend/queries/borrow/borrow-claimable-crv.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV } from '@evm-ui/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useMarketContext } from '../../market-context'
import { CLAIM_TAB_COLUMNS, type ClaimableToken } from '../../supply/components/columns'

export const useBorrowClaimForm = <ChainId extends IChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, crvTokenAddress, userAddress } = useMarketContext<ChainId>()
  const { chainId, blockchainId } = network
  const params = useMemo(
    (): UserMarketParams<ChainId> => ({ chainId, marketId, userAddress }),
    [chainId, marketId, userAddress],
  )
  const form = useForm({ defaultValues: {} })

  const { data: claimableCrv, isLoading, error: claimableCrvError } = useBorrowClaimableCrv(params)
  const {
    data: usdRates,
    isLoading: usdRateLoading,
    error: usdRateError,
  } = useTokenUsdRates({ chainId, tokenAddresses: notFalsy(crvTokenAddress) })

  const claimableTokens = useMemo((): ClaimableToken[] => {
    if (!crvTokenAddress || !claimableCrv || !(Number(claimableCrv) > 0)) return []
    return [
      {
        amount: claimableCrv,
        token: crvTokenAddress,
        symbol: MAINNET_CRV.symbol,
        notional: maybe(usdRates?.[crvTokenAddress], usdRate => Number(claimableCrv) * usdRate),
        blockchainId,
        isLoading: usdRateLoading,
      },
    ]
  }, [crvTokenAddress, claimableCrv, usdRates, blockchainId, usdRateLoading])

  const table = useCurveTable({
    columns: CLAIM_TAB_COLUMNS,
    query: q({ data: claimableTokens, isLoading, error: claimableCrvError }),
  })
  const {
    onSubmit: onSubmitCrv,
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
    totalNotionals: claimableTokens[0]?.notional,
    usdRateLoading,
    isLoading,
    onSubmitCrv: form.handleSubmit(onSubmitCrv),
    isCrvDisabled: [!!claimableCrvError, claimableTokens.length === 0, isPending].some(Boolean),
    isCrvPending: isPending,
    errors: notFalsy(usdRateError, claimableCrvError, claimCrvError),
  }
}
