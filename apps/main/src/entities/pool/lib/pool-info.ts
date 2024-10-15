import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/pool/model/pool-query-options'

export const usePoolTokenList = createQueryHook(models.getPoolTokenList)
export const usePoolSeedAmounts = createQueryHook(models.getPoolSeedAmounts)
export const usePoolDetails = createQueryHook(models.getPoolDetails)
export const usePoolUnderlyingCurrencyReserves = createQueryHook(models.getPoolUnderlyingCurrencyReserves)
export const usePoolWrappedCurrencyReserves = createQueryHook(models.getPoolWrappedCurrencyReserves)
