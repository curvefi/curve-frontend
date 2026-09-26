import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { depositQueryValidationSuite } from './deposit.validation'
import type { DepositParams, DepositQuery } from './types'

const getPool = ({ poolId }: DepositQuery) => requireLib('curveApi').getPool(poolId)

const call = <T>(
  params: DepositQuery,
  underlying: (pool: ReturnType<typeof getPool>) => Promise<T>,
  wrapped: (pool: ReturnType<typeof getPool>) => Promise<T>,
) => (params.isWrapped ? wrapped(getPool(params)) : underlying(getPool(params)))

// Curve's API requires a dense vector. An unentered form field represents a zero deposit for that coin.
const getApiAmounts = (params: DepositQuery) =>
  getPoolAmounts(params, params.decimals?.length)!.map(amount => amount ?? '0')

export const { useQuery: useDepositExpected } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositExpected',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
      { slippage },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    (await call(
      params,
      pool => pool.depositExpected(getApiAmounts(params)),
      pool => pool.depositWrappedExpected(getApiAmounts(params)),
    )) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const { useQuery: useDepositBonus } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositBonus',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
      { slippage },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    (await call(
      params,
      pool => pool.depositBonus(getApiAmounts(params)),
      pool => pool.depositWrappedBonus(getApiAmounts(params)),
    )) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositIsApproved',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    await call(
      params,
      pool => pool.depositIsApproved(getApiAmounts(params)),
      pool => pool.depositWrappedIsApproved(getApiAmounts(params)),
    ),
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

const { useQuery: useDepositApproveEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'estimateGas.depositApprove',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    await call(
      params,
      pool => pool.estimateGas.depositApprove(getApiAmounts(params)),
      pool => pool.estimateGas.depositWrappedApprove(getApiAmounts(params)),
    ),
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

const { useQuery: useDepositEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'estimateGas.deposit',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
      { slippage },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    await call(
      params,
      pool => pool.estimateGas.deposit(getApiAmounts(params), Number(params.slippage)),
      pool => pool.estimateGas.depositWrapped(getApiAmounts(params), Number(params.slippage)),
    ),
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const { useQuery: useSeedAmounts } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositSeedAmounts',
      { isWrapped },
      { amounts: getPoolAmounts(values as Partial<PoolTokenFields>, decimals?.length) },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    (await getPool(params).getSeedAmounts(getApiAmounts(params)[0], !params.isWrapped)) as Decimal[],
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

const useDepositEstimateGasQuery = createApprovedEstimateGasHook({
  useIsApproved: useDepositIsApproved,
  useApproveEstimate: useDepositApproveEstimate,
  useActionEstimate: useDepositEstimate,
})

export const useDepositEstimateGas = (params: DepositParams) => {
  const { isHydrated } = useCurve()
  return useDepositEstimateGasQuery(params, isHydrated)
}
