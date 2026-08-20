import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useFormContext } from '@evm-ui/features/forms'

export const useAddRewardTokenFormContext = () => useFormContext<AddRewardFormValues>()
