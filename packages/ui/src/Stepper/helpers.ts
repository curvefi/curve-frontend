import { css } from 'styled-components'
import type { Step, StepStatus } from '@ui/Stepper/types'

export const isInProgress = (step: Step) => step.status === 'in-progress'

export const statusColorMap = (status?: StepStatus) => {
  if (!status) {
    return ''
  }

  switch (status) {
    case 'succeeded':
      return 'var(--success-400)'
    case 'in-progress':
    case 'current':
      return 'var(--button--background-color)'
    case 'failed':
      return 'var(--danger-color)'
    case 'pending':
      return 'var(--button--disabled--background-color)'
    default:
      throw 'Invalid step status'
  }
}

export const taskStepStatusStyles = (status: StepStatus) => {
  switch (status) {
    case 'in-progress':
    case 'current':
      return css`
        color: var(--text-light-color);
        border: none;
        background-color: var(--primary-400);
      `
    case 'pending':
      return css`
        border: none;
        background-color: var(--button--disabled--background-color);
      `
    case 'failed':
      return css`
        color: var(--danger-400);
        border: 2px solid var(--danger-400);
        background-color: var(--danger-600);
      `
    case 'succeeded':
      return css`
        color: var(--success-400);
        border: 2px solid var(--success-400);
        background-color: var(--success-600);
      `

    default:
      break
  }
}

export function getStepStatus(isSuccess: boolean, isInProgress: boolean, isValid: boolean): StepStatus {
  if (isSuccess) {
    return 'succeeded'
  }
  if (isInProgress) {
    return 'in-progress'
  }
  if (isValid) {
    return 'current'
  }
  return 'pending'
}

export function getActiveStep(steps: Step[]) {
  const foundIdx = steps.findIndex((step) => step.status === 'current' || step.status === 'in-progress')
  if (foundIdx !== -1) {
    return foundIdx + 1
  }
  return null
}
