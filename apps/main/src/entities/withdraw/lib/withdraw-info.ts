import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/withdraw/model/withdraw-query-options'

export const useClaimableDetails = createQueryHook(models.getClaimableDetails)
export const useClaimableEstGas = createQueryHook(models.getClaimableEstGas)
export const useWithdrawDetails = createQueryHook(models.getWithdrawDetails)
export const useWithdrawEstGasApproval = createQueryHook(models.getWithdrawEstGasApproval)
export const useUnstakeEstGas = createQueryHook(models.getUnstakeEstGas)
