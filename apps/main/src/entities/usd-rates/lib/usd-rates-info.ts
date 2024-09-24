import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/usd-rates/model/usd-rates-options'

export const useUsdRates = createQueryHook(models.getUsdRates)
