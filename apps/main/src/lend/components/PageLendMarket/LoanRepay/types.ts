import { Dispatch, SetStateAction } from 'react'
import type { FormDetailInfo, InpError } from '@/lend/components/PageLendMarket/types'
import { ExpectedBorrowed, type FormStatus as Fs, PageContentProps } from '@/lend/types/lend.types'
import type { HealthMode } from '@/llamalend/llamalend.types'
import type { Step } from '@ui/Stepper/types'

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
