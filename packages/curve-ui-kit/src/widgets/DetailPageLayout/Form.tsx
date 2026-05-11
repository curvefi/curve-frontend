import { useMemo, type SubmitEventHandler, type ReactNode } from 'react'
import { FormProvider } from '@ui-kit/features/forms'
import type { FieldValues, UseFormReturn } from '@ui-kit/features/forms'
import { FormContent } from './FormContent'

/**
 * A form element that includes a provider, a form tag, and a content wrapper.
 * Supports a footer below the form (outside the background area).
 */
export const Form = <TFieldValues extends FieldValues>({
  onSubmit,
  children,
  footer,
  handleSubmit,
  trigger,
  reset,
  watch,
  getValues,
  setValue,
  setError,
  clearErrors,
  formState,
}: {
  onSubmit: SubmitEventHandler<HTMLFormElement>
  children: ReactNode
  footer: ReactNode
} & UseFormReturn<TFieldValues>) => {
  const form = useMemo<UseFormReturn<TFieldValues>>(
    () => ({
      handleSubmit,
      trigger,
      reset,
      watch,
      getValues,
      setValue,
      setError,
      clearErrors,
      formState,
    }),
    [clearErrors, formState, getValues, handleSubmit, reset, setError, setValue, trigger, watch],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
        <FormContent footer={footer}>{children}</FormContent>
      </form>
    </FormProvider>
  )
}
