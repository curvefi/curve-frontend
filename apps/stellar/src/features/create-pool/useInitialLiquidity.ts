import { useCallback, useEffect, useRef } from 'react'
import { asStellarContract } from '@/stellar/features/connect-wallet/address'
import type { DepositMutation } from '@/stellar/features/deposit/types'
import { useDepositMutation } from '@/stellar/mutations/deposit.mutation'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolParams, UserParams } from '@/stellar/queries/query-types'
import { getCreatePoolDecimals, getCreatePoolTokens } from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormValues, CreatePoolTokenFields } from '@ui/features/create-pool/types'
import { getPoolAmounts, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { q } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type InitialLiquidityForm = PoolTokenFields &
  CreatePoolTokenFields &
  Pick<CreatePoolFormValues, 'maxAmounts' | 'tokenCount'>

/** Loads post-deployment quotes and starts a regular deposit once; retries use the same deposit mutation. */
export const useInitialLiquidity = ({
  network,
  account,
  pool,
  autoDeposit,
  ...params
}: PoolParams &
  UserParams &
  FieldsOf<InitialLiquidityForm> & { autoDeposit: InitialLiquidityForm | false | undefined }) => {
  const depositStartedRef = useRef(false) // Mutation flags update on the next render; this synchronous guard also prevents StrictMode effect replay.
  const supply = usePoolSupply({ network, pool })
  const quote = useExpectedLp({
    network,
    pool,
    maxAmounts: params.maxAmounts,
    supply: supply.data,
    decimals: getCreatePoolDecimals(params, params.tokenCount),
    amounts: getPoolAmounts(params, params.tokenCount),
    isDeposit: true,
  })
  const { mutate, error, isPending, isSuccess, status } = useDepositMutation({
    network,
    pool,
    account,
    tokens: getCreatePoolTokens(params, params.tokenCount)?.map(token => asStellarContract(token?.address)),
    quote: quote.data,
    minMint: quote.data, // Initial liquidity must receive the full quoted LP amount.
  })
  const onSubmit = useCallback(
    (values: InitialLiquidityForm) => {
      depositStartedRef.current = true // Manual retries also prevent automatic resubmission when queries recover.
      mutate({
        maxAmounts: values.maxAmounts,
        slippage: '0', // Initial liquidity must receive the full quoted LP amount.
        isSeed: true,
        supply: supply.data,
        decimals: getCreatePoolDecimals(values, values.tokenCount),
        amounts: getPoolAmounts(values, values.tokenCount),
      } as DepositMutation)
    },
    [mutate, supply.data],
  )

  const preparationError = supply.error ?? quote.error
  useEffect(() => {
    // Deployment locks the form, then supplies the pool address. Resume its requested deposit once the quote loads.
    if (
      autoDeposit &&
      !depositStartedRef.current &&
      quote.data &&
      !preparationError // Failed refetches retain cached data; do not auto-submit that quote.
    ) {
      onSubmit(autoDeposit)
    }
  }, [autoDeposit, quote.data, preparationError, onSubmit])

  const isPreparing = !!autoDeposit && !isSuccess && !error && !preparationError

  return {
    onSubmit,
    expectedLp: q(quote),
    isSuccess,
    status,
    isPending: isPending || isPreparing,
    isLoading: isPending || isPreparing || supply.isLoading || quote.isLoading,
    error: error ?? preparationError,
  }
}
