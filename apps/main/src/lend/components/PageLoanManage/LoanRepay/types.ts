import type { FormDetailInfo, FormStatus as Fs } from '@/lend/components/PageLoanManage/types'
import type { InpError } from '@/lend/components/PageLoanCreate/types'
import type { Step } from '@ui/Stepper/types'
import { ExpectedBorrowed, PageContentProps, HealthMode } from '@/lend/types/lend.types'
import { Dispatch, SetStateAction } from 'react'

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
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
}

export type FormDetailInfoLeverage = FormDetailInfo & {
  repayIsFull: boolean
  expectedBorrowed: ExpectedBorrowed | null
  routeImage: string | null
  priceImpact: string
  isHighPriceImpact: boolean
}
