import { PoolCurrencyReserves, PoolQueryParams, PoolSeedAmounts, PoolTokensList } from '@/entities/pool'

export function enableBase({ chainId, poolId }: PoolQueryParams) {
  return !!chainId && !!poolId
}

export function enablePoolTokensList(params: PoolTokensList) {
  return enableBase(params)
}

export function enablePoolSeedAmounts({ isSeed, firstAmount, useUnderlying, ...rest }: PoolSeedAmounts) {
  const isValidSeed = isSeed !== null && isSeed
  return enableBase(rest) && isValidSeed && Number(firstAmount) > 0
}

export function enablePoolWrappedCurrencyReserves({ isWrapped, ...rest }: PoolCurrencyReserves) {
  return enableBase(rest) && isWrapped
}
