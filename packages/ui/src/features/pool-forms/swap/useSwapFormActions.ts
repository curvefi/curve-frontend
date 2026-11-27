import { combineFormActions, type UseFormHandleSubmit } from '@ui/features/forms'
import type { QueryProp } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'
import type { SwapFormValues } from './swap-form.utils'

export const useSwapFormActions = ({
  handleSubmit,
  lowExchangeRate: { data: isRequired, error, isLoading },
  onConfirmed,
}: {
  handleSubmit: UseFormHandleSubmit<SwapFormValues>
  lowExchangeRate: QueryProp<boolean>
  onConfirmed: (values: SwapFormValues) => void
}) => {
  const [isOpen, open, close] = useSwitch(false)
  const lowRate = { isRequired, isLoading, error, isOpen, open, close }
  const { onSubmit, getModalProps } = combineFormActions({ handleSubmit, actions: [lowRate], onConfirmed })
  return { onSubmit, lowRateModal: getModalProps(lowRate) }
}
