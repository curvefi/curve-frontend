import useStore from '@/loan/store/useStore'
import type { HealthColorKey, UserLoanDetails } from '@/loan/types/loan.types'

/**
 * Retrieves user loan details for a specific llamma market
 * @param llammaId - The llamma market identifier
 * @returns User loan details object or undefined if not found
 */
export const useUserLoanDetails = (llammaId: string): UserLoanDetails | undefined =>
  useStore((state) => state.loans.userDetailsMapper[llammaId])

/**
 * Gets the health status color key for a user's loan
 * @param llammaId - The llamma market identifier
 * @returns Health color key indicating loan status, or empty string if no status available
 */
export const useUserLoanStatus = (llammaId: string): HealthColorKey =>
  useUserLoanDetails(llammaId)?.userStatus?.colorKey ?? ''
