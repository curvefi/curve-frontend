import type { FieldValues, UseFormHandleSubmit } from './form.types'

/**
 * An action that may need the user's confirmation (usually via a modal) before the form action runs.
 * Each action owns its open state, so it can enable its own queries (e.g. gas) only while open.
 * Action hooks may return extra fields (modal data, banners...), the form reads those from the action directly.
 */
export type FormAction<K extends string = string> = {
  key: K
  isRequired: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  isLoading?: boolean
  error?: Error | null
}

export type FormActionModalProps = { open: boolean; onClose: () => void; onConfirm: () => void }

/**
 * Runs the required `actions` in order before calling `onConfirmed`.
 * The first required action opens; confirming it revalidates the form and continues with the next one.
 * To add an action, create a hook returning a `FormAction`, add it to `actions` and render its modal.
 */
export function combineFormActions<T extends FieldValues, const K extends string>({
  handleSubmit,
  actions,
  onConfirmed,
}: {
  handleSubmit: UseFormHandleSubmit<T>
  actions: readonly FormAction<K>[]
  onConfirmed: (values: T) => unknown
}) {
  const runFrom = (index: number) => (values: T) => {
    actions.forEach(action => action.close())
    const next = actions.slice(index).find(action => action.isRequired)
    if (next) next.open()
    else void onConfirmed(values)
  }

  return {
    onSubmit: handleSubmit(runFrom(0)),
    modals: Object.fromEntries(
      actions.map(({ key, isOpen, close }, index) => [
        key,
        {
          open: isOpen,
          onClose: close,
          onConfirm: () => void handleSubmit(runFrom(index + 1))(),
        } satisfies FormActionModalProps,
      ]),
    ) as Record<K, FormActionModalProps>,
    isLoading: actions.some(action => action.isLoading),
    error: actions.find(action => action.error)?.error ?? null,
  }
}
