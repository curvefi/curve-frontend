import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useFormContext } from '@ui-kit/features/forms'

export const useAddRewardTokenFormContext = () => useFormContext<AddRewardFormValues>()
