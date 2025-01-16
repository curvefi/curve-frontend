import { useFormContext } from 'react-hook-form'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'

export const useAddRewardTokenFormContext = () => useFormContext<AddRewardFormValues>()
