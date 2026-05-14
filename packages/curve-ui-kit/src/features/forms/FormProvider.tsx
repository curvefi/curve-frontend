import { type ReactNode, useMemo } from 'react'
import AccordionDetails from '@mui/material/AccordionDetails'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { isDevelopment } from '@ui-kit/utils'
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
          isTouched,
          formState,
        ],
      )}
    >
      {children}
      {isDevelopment && (
        <Accordion title={t`Form state`} ghost size="extraSmall">
          <AccordionDetails>
            <pre>{JSON.stringify({ values: form.getValues(), ...form.formState }, null, 2).slice(2, -2)}</pre>
          </AccordionDetails>
        </Accordion>
      )}
    </FormContext.Provider>
  )
}
