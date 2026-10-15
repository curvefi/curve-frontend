import { useStore } from '@/dex/store/useStore'
import { getErrorMessage } from '@ui/features/errors/errors.util'

/** Terminal handler for unexpected failures outside the legacy API wrappers. */
export const handleWithdrawError = (activeKey: string, error: unknown) => {
  const state = useStore.getState().poolWithdraw
  if (state.activeKey !== activeKey) return
  state.setStateByKey('formStatus', {
    ...state.formStatus,
    formProcessing: false,
    step: '',
    error: getErrorMessage(error, 'error-step-withdraw'),
  })
}
