import type { FormStatus as Fs } from '@/components/PageLoanManage/types'

export type ItemKey = '0' | '1'

export type FormValues = {
  item1: string
  item1Error: string
  item1Key: ItemKey
  item2: string
  item2Error: string
  item2Key: ItemKey
}

export type StepKey = 'APPROVAL' | 'SWAP' | ''

export interface FormStatus extends Fs {
  step: StepKey
}

export type FormDetailInfo = {
  isExpected: boolean | null
  amount: string
  swapPriceImpact: string
  loading?: boolean
}
