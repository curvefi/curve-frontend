import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/deposit/model/deposit-query-options'

export const useDepositDetails = createQueryHook(models.getDepositDetails)
export const useDepositBalancedAmounts = createQueryHook(models.getDepositBalancedAmounts)
export const useDepositApproval = createQueryHook(models.getDepositApproval)
export const useDepositEstGas = createQueryHook(models.getDepositEstGas)
