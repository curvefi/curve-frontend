import type { StepStatus } from '@/ui/Stepper/types'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

export function getStepStatus(isComplete: boolean, isInProgress: boolean, isValid: boolean): StepStatus {
  return isComplete ? 'succeeded' : isInProgress ? 'in-progress' : isValid ? 'current' : 'pending'
}

export function parseHealthPercent(healthPercent: string) {
  let percent = 0
  if (healthPercent) {
    percent = Number(healthPercent) > 100 ? 100 : Number(healthPercent)
  }
  return formatNumber(percent, { style: 'percent', maximumFractionDigits: 2 })
}

export function getTokenName(llamma: Llamma | null) {
  const [stablecoin, collateral] = llamma?.coins ?? ['', '']
  return { stablecoin, collateral }
}
