import { useStore } from '@/dex/store/useStore'
import { getErrorMessage } from '@ui/features/errors/errors.util'

/** Terminal handler for unexpected failures outside the legacy API wrappers. */
export const handleWithdrawError = (activeKey: string, exception: unknown) => {
  const { activeKey: currentKey, formStatus, setStateByKey } = useStore.getState().poolWithdraw
  if (currentKey === activeKey) {
    const error = getErrorMessage(exception, 'error-step-withdraw')
    setStateByKey('formStatus', { ...formStatus, formProcessing: false, step: '', error })
  }
}
