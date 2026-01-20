import { useStore } from '@/lend/store/useStore'
import type { UserLoanDetails } from '@/lend/types/lend.types'

type Details = UserLoanDetails['details'] & { error: string }

/**
 * Retrieves user loan details for a specific user active key.
 * @param userActiveKey - The unique identifier for the user's active loan
 * @returns User loan details object with error property merged for easier destructuring
 */
export function useUserLoanDetails(userActiveKey: string): Partial<Details> {
  const loanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  return !loanDetails || loanDetails.details == null ? {} : { ...loanDetails.details, error: loanDetails.error }
}
