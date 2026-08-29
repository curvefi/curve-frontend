import { useUserProfileStore } from '@evm-ui/features/user-profile/store'
import { aprToApy } from '@evm-ui/utils/rates'

function keepApr(aprPercentage: number, compoundingDays?: number): number
function keepApr(aprPercentage: number | null | undefined, compoundingDays?: number): number | null
function keepApr(aprPercentage: number | null | undefined): number | null {
  return aprPercentage ?? null
}

export const useRateDisplay = () => useUserProfileStore(state => state.rateDisplay)

export const useAprToApy = () => (useRateDisplay() === 'apy' ? aprToApy : keepApr)
