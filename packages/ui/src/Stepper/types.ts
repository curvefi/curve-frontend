import * as React from 'react'

export type StepStatus = 'current' | 'pending' | 'in-progress' | 'succeeded' | 'failed'

export type StepTask = {
  key: string
  status: StepStatus
  type: 'task'
  content: React.ReactNode
}

export type StepAction = {
  key: string
  status: StepStatus
  type: 'action'
  content: React.ReactNode
  onClick: () => void
}

export type StepActionModal = {
  key: string
  status: StepStatus
  type: 'action'
  content: React.ReactNode
  modal: {
    title: string
    content: React.ReactNode
    isDismissable: boolean
    cancelBtnProps?: {
      label?: string | undefined
      onClick: () => void
    }
    primaryBtnProps: React.ButtonHTMLAttributes<HTMLButtonElement>
    primaryBtnLabel: string
    testId?: string
  }
}

export type Step = StepTask | StepAction | StepActionModal
