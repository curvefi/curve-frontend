import { FormStatus as Fs } from '@/components/PageLoanManage/types'
import { Step } from '@/ui/Stepper/types'
import React from 'react'

export type StepKey = 'APPROVAL' | 'CREATE' | ''

export type FormValues = {
  collateral: string
  collateralError: 'too-much-wallet' | 'too-much-max' | ''
  debt: string
  debtError: 'too-much' | string
  liqRange: string
  n: number | null
}

export interface FormStatus extends Fs {
  error: string
  warning: 'loan-exists' | string
  step: StepKey
}

export type FormDetailInfo = {
  activeKey: string
  activeKeyLiqRange: string
  chainId: ChainId
  api: Api | null
  formEstGas: FormEstGas
  formValues: FormValues
  haveSigner: boolean
  healthMode: HealthMode
  isAdvanceMode: boolean
  isReady: boolean
  owm: OWM | null
  owmId: string
  steps: Step[]
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
  updateFormValues: (updatedFormValues: FormValues) => void
}

export type FormEstGas = {
  estimatedGas: number
  loading?: boolean
}
