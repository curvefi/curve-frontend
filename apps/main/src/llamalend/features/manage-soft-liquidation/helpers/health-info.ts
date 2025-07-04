import type { ActionInfosProps } from '..'
import type { UserLoanDetails } from '../types'

type Props = {
  userLoanDetails: Pick<UserLoanDetails, 'healthFull'> | undefined
}

/** Calculates the current health of a user's loan position */
export function getHealthInfo({ userLoanDetails }: Props): ActionInfosProps['health'] {
  const { healthFull: healthFullRaw } = userLoanDetails ?? {}
  const healthFull = isNaN(parseFloat(healthFullRaw ?? '')) ? 0 : parseFloat(healthFullRaw ?? '')

  return { current: healthFull }
}
