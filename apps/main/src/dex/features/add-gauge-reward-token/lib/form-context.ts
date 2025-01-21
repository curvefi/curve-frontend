import { useFormContext } from 'react-hook-form'
import type { AddRewardFormValues } from '@main/features/add-gauge-reward-token/types'

export const useAddRewardTokenFormContext = () => useFormContext<AddRewardFormValues>()
