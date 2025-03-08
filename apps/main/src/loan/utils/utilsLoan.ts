import { Llamma } from '@/loan/types/loan.types'
import type { StepStatus } from '@ui/Stepper/types'
import { formatNumber } from '@ui/utils'

export function getStepStatus(isComplete: boolean, isInProgress: boolean, isValid: boolean): StepStatus {
  return isComplete ? 'succeeded' : isInProgress ? 'in-progress' : isValid ? 'current' : 'pending'
}

export function parseHealthPercent(healthPercent: string) {
  return formatNumber(healthPercent, { style: 'percent', maximumFractionDigits: 2 })
}

export function getTokenName(llamma: Llamma | null) {
  const [stablecoin, collateral] = llamma?.coins ?? ['', '']
  return { stablecoin, collateral }
}
