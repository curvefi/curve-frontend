import { useStore } from '@/loan/store/useStore'
import type { UserLoanDetails } from '@/loan/types/loan.types'

/**
 * Retrieves user loan details for a specific llamma market
 * @param llammaId - The llamma market identifier
 * @returns User loan details object or undefined if not found
 */
export const useUserLoanDetails = (llammaId: string): UserLoanDetails | undefined =>
  useStore((state) => state.loans.userDetailsMapper[llammaId])
