import { useFormContext } from 'react-hook-form'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'

export const useAddRewardTokenFormContext = () => {
  return useFormContext<AddRewardFormValues>()
}
