import { ButtonHTMLAttributes, ReactNode } from 'react'

export type StepStatus = 'current' | 'pending' | 'in-progress' | 'succeeded' | 'failed'

export type StepTask = {
  key: string
  status: StepStatus
  type: 'task'
  content: ReactNode
}

export type StepAction = {
  key: string
  status: StepStatus
  type: 'action'
  content: ReactNode
  onClick: () => void
}

export type StepActionModal = {
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
    primaryBtnProps: ButtonHTMLAttributes<HTMLButtonElement>
    primaryBtnLabel: string
    testId?: string
  }
}

export type Step = StepTask | StepAction | StepActionModal
