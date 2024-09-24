import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/deposit/model/deposit-query-options'

export const useDepositDetails = createQueryHook(models.getDepositDetails)
export const useDepositBalancedAmounts = createQueryHook(models.getDepositBalancedAmounts)
export const useDepositEstGasApproval = createQueryHook(models.getDepositEstGasApproval)
export const useStakeEstGasApproval = createQueryHook(models.getStakeEstGasApproval)
