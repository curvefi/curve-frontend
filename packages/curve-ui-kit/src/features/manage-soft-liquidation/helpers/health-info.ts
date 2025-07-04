import type { ActionInfosProps } from '..'
import { UserLoanDetails as UserLoanDetailsMain } from '../types'

type UserLoanDetails = Pick<UserLoanDetailsMain, 'healthFull'>

type Props = {
  userLoanDetails?: UserLoanDetails
}

/** Calculates the current health of a user's loan position */
export function getHealthInfo({ userLoanDetails }: Props): ActionInfosProps['health'] {
  const { healthFull: healthFullRaw } = userLoanDetails ?? {}
  const healthFull = isNaN(parseFloat(healthFullRaw ?? '')) ? 0 : parseFloat(healthFullRaw ?? '')

  return { current: healthFull }
}
