import { type ReactNode, useMemo } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'
import { FormContext } from './useFormContext'

export type FormProviderProps<T extends FieldValues> = UseFormReturn<T> & { children: ReactNode }
export const FormProvider = <T extends FieldValues>({
  children,
  handleSubmit,
  reset,
  watchValues,
  watchValue,
  getValues,
  getValue,
  update,
  setError,
  clearErrors,
  setRootError,
  clearRootError,
  isTouched,
  formState: { errors, visibleErrors, isValid, isSubmitting, isDirty, dirtyFields, touchedFields },
}: FormProviderProps<T>) => {
  const formState = useMemo(
    () => ({ errors, visibleErrors, isValid, isSubmitting, isDirty, dirtyFields, touchedFields }),
    [errors, visibleErrors, isValid, isSubmitting, isDirty, dirtyFields, touchedFields],
  )
  return (
    <FormContext.Provider
      value={useMemo(
        /** memoize the provider value to prevent unnecessary re-renders of consuming components */
        () =>
          ({
            handleSubmit,
            reset,
            watchValues,
            watchValue,
            getValues,
            getValue,
            update,
            setError,
            clearErrors,
            setRootError,
            clearRootError,
            isTouched,
            formState,
          }) as UseFormReturn,
        [
          handleSubmit,
          reset,
          watchValues,
          watchValue,
          getValues,
          getValue,
          update,
          setError,
          clearErrors,
          setRootError,
          clearRootError,
          isTouched,
          formState,
        ],
      )}
    >
      {children}
    </FormContext.Provider>
  )
}
