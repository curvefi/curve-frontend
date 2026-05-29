import { type MouseEvent, ReactNode } from 'react'

export type StepStatus = 'current' | 'pending' | 'in-progress' | 'succeeded' | 'failed'

export interface StepTask {
  key: string
  status: StepStatus
  type: 'task'
  content: ReactNode
}

export interface StepAction {
  key: string
  status: StepStatus
  type: 'action'
  content: ReactNode
  onClick: () => void
}

export interface StepActionModal {
  key: string
  status: StepStatus
  type: 'action'
  content: ReactNode
  modal: {
    title: string
    content: ReactNode
    initFn?: () => void
    isDismissable: boolean
    cancelBtnProps?: {
      label?: string | undefined
      onClick: () => void
    }
    primaryBtnProps: {
      onClick: (event: MouseEvent<HTMLButtonElement>) => void
      disabled?: boolean
    }
    primaryBtnLabel: string
    testId?: string
  }
}

export type Step = StepTask | StepAction | StepActionModal
