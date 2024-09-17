import { QueryFunction } from '@tanstack/react-query'
import { IExtendedPoolsDataFromApi, IPoolType, PoolQueryKeyType } from '@/entities/pool'
import useStore from '@/store/useStore'
import { assertPoolsValidity } from '@/entities/pool/lib/validation'

export const queryPools: QueryFunction<
  Record<IPoolType, IExtendedPoolsDataFromApi>,
  PoolQueryKeyType<'root'>
> = ({ queryKey }) => {
  const [, chainId, , , ] = queryKey
  assertPoolsValidity({ chainId })

  const curve = useStore.getState().curve
  return curve.getPoolsDataFromApi()
}
