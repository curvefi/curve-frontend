import type { z } from 'zod'
import type { schema } from '@/features/deposit-gauge-reward/model/form-schema'

export type DepositRewardFormValues = z.infer<typeof schema>

export enum DepositRewardStep {
  APPROVAL = 'APPROVAL',
  DEPOSIT = 'DEPOSIT',
  CONFIRMATION = 'CONFIRMATION',
}
