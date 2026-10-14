import { notFalsy } from '@primitives/objects.utils'
import type { FieldValues, UseFormHandleSubmit } from './form.types'

type FormAction = {
  isRequired: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  isLoading?: boolean
  error?: Error | null
}

/**
 * Runs the required `actions` in order before calling `onConfirmed`.
 * The first required action opens; confirming it revalidates the form and continues with the next one.
 * Actions can be undefined, so forms can pass optional actions directly.
 */
export function combineFormActions<T extends FieldValues>({
  handleSubmit,
  actions,
  onConfirmed,
}: {
  handleSubmit: UseFormHandleSubmit<T>
  actions: (FormAction | undefined)[]
  onConfirmed: (values: T) => unknown
}) {
  const givenActions = notFalsy(...actions)
  const runFrom = (index: number) => (values: T) => {
    givenActions.forEach(action => action.close())
    const next = givenActions.slice(index).find(action => action.isRequired)
    if (next) next.open()
    else void onConfirmed(values)
  }

  return {
    onSubmit: handleSubmit(runFrom(0)),
    /** Props for the modal of the given action */
    getModalProps: (action: FormAction) => ({
      open: action.isOpen,
      onClose: action.close,
      onConfirm: () => void handleSubmit(runFrom(givenActions.indexOf(action) + 1))(),
    }),
    isLoading: givenActions.some(action => action.isLoading),
    error: givenActions.find(action => action.error)?.error ?? null,
  }
}
