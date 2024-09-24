import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/swap/model/swap-query-options'

export const useSwapIgnoreExchangeRateCheck = createQueryHook(models.getSwapIgnoreExchangeRateCheck)
export const useSwapExchangeDetails = createQueryHook(models.getSwapExchangeDetails)
export const useSwapEstGasApproval = createQueryHook(models.getSwapEstGasApproval)
