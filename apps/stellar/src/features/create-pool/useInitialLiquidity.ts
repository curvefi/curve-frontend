import { useCallback, useEffect, useRef } from 'react'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { DepositForm, DepositMutation } from '@/stellar/features/deposit/types'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { useDepositMutation } from '@/stellar/mutations/deposit.mutation'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolParams, UserParams } from '@/stellar/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { getPoolAmounts, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type InitialLiquidityForm = PoolTokenFields &
  Pick<DepositForm, 'decimals' | 'slippage'> & { maxAmounts: (Decimal | undefined)[] | undefined }

/** Loads post-deployment quotes and starts a regular deposit once; retries use the same deposit mutation. */
export const useInitialLiquidity = ({
  network,
  account,
  pool,
  tokens,
  autoDeposit,
  params,
}: PoolParams &
  UserParams & {
    tokens: StellarContract[] | undefined
    autoDeposit: InitialLiquidityForm | false | undefined
    params: FieldsOf<InitialLiquidityForm>
  }) => {
  const depositStartedRef = useRef(false) // Mutation flags update on the next render; this synchronous guard also prevents StrictMode effect replay.
  const supply = usePoolSupply({ network, pool })
  const quote = useExpectedLp({
    ...params,
    network,
    pool,
    supply: supply.data,
    amounts: getPoolAmounts(params, tokens?.length),
    isDeposit: true,
  })
  const minimum = mapQuery(quote, value => maybe(params.slippage, slippage => calculateMinimumMint(value, slippage)))
  const { mutate, error, isPending, isSuccess } = useDepositMutation({
    network,
    pool,
    account,
    tokens,
    quote: quote.data,
    minMint: minimum.data,
  })
  const onSubmit = useCallback(
    (values: InitialLiquidityForm) => {
      depositStartedRef.current = true // Manual retries also prevent automatic resubmission when queries recover.
      mutate({
        ...values,
        supply: supply.data,
        amounts: getPoolAmounts(values, values.decimals?.length),
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
    isSuccess,
    isDepositing: isPending,
    isPending: isPending || isPreparing,
    isLoading: isPending || isPreparing || supply.isLoading || quote.isLoading,
    error: error ?? preparationError,
  }
}
