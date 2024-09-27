import { createQueryHook } from '@/shared/lib/queries/factory'
import * as models from '@/entities/withdraw/model/withdraw-query-options'

export const useClaimableDetails = createQueryHook(models.getClaimableDetails)
export const useClaimableEstGas = createQueryHook(models.getClaimableEstGas)
export const useWithdrawDetails = createQueryHook(models.getWithdrawDetails)
export const useWithdrawApproval = createQueryHook(models.getWithdrawApproval)
export const useWithdrawEstGas = createQueryHook(models.getWithdrawEstGas)
export const useUnstakeEstGas = createQueryHook(models.getUnstakeEstGas)
