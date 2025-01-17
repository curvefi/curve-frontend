import type { FormDetailInfo, FormStatus as Fs } from '@/components/PageLoanManage/types'
import type { InpError } from '@/components/PageLoanCreate/types'
import type { Step } from '@/ui/Stepper/types'
import React from 'react'
import { ExpectedBorrowed, PageContentProps, HealthMode } from '@/types/lend.types'

export type FormValues = {
  stateCollateral: string
  stateCollateralError: 'too-much-collateral' | ''
  userCollateral: string
  userCollateralError: InpError
  userBorrowed: string
  userBorrowedError: InpError | 'too-much-debt'
  isFullRepay: boolean
}

export type StepKey = 'APPROVAL' | 'REPAY' | ''

export interface FormStatus extends Fs {
  warning: string
  step: StepKey
  stepError: string
}

export type DetailProps = Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'api' | 'userActiveKey'> & {
  activeKey: string
  activeStep: number | null
  healthMode: HealthMode
  isFullRepay: boolean
  steps: Step[]
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
}

export type FormDetailInfoLeverage = FormDetailInfo & {
  repayIsFull: boolean
  expectedBorrowed: ExpectedBorrowed | null
  routeImage: string | null
  priceImpact: string
  isHighPriceImpact: boolean
}
