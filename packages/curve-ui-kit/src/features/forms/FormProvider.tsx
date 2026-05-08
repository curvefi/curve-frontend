import { type ReactNode, useMemo } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'
import { FormContext } from './useFormContext'

export type FormProviderProps<T extends FieldValues> = UseFormReturn<T> & { children: ReactNode }
export const FormProvider = <T extends FieldValues>({
  children,
  handleSubmit,
  trigger,
  reset,
  watchValues,
  watchValue,
  getValues,
  getValue,
  updateForm,
  setError,
  clearErrors,
  isTouched,
  formState,
}: FormProviderProps<T>) => (
  <FormContext.Provider
    value={useMemo(
      /** memoize the provider value to prevent unnecessary re-renders of consuming components */
      () =>
        ({
          handleSubmit,
          trigger,
          reset,
          watchValues,
          watchValue,
          getValues,
          getValue,
          updateForm,
          setError,
          clearErrors,
          isTouched,
          formState,
        }) as UseFormReturn,
      [
        handleSubmit,
        trigger,
        reset,
        watchValues,
        watchValue,
        getValues,
        getValue,
        updateForm,
        setError,
        clearErrors,
        isTouched,
        formState,
      ],
    )}
  >
    {children}
  </FormContext.Provider>
)
