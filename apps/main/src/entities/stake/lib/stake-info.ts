import { createQueryHook } from '@/shared/lib/queries/factory'
import { getStakeApproval, getStakeEstGas } from '@/entities/stake/model/stake-query-options'

export const useStakeApproval = createQueryHook(getStakeApproval)
export const useStakeEstGas = createQueryHook(getStakeEstGas)
