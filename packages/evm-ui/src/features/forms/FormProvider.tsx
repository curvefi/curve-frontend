import { type ReactNode, useMemo } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { Accordion } from '@evm-ui/shared/ui/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import { IS_DEVELOPMENT } from '@ui/utils/env'
import type { FieldValues, UseFormReturn } from './form.types'
import { FormContext } from './useFormContext'

export type FormProviderProps<T extends FieldValues> = UseFormReturn<T> & {
  children: ReactNode
  hideFormState?: boolean // Hide the development-only form state accordion.
}
export const FormProvider = <T extends FieldValues>({
  children,
  hideFormState = false,
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
    <FormContext
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
      {IS_DEVELOPMENT && !hideFormState && (
        <Accordion title={t`Form state`} ghost size="extraSmall">
          <AccordionDetails>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {JSON.stringify({ values: getValues(), ...formState }, null, 2).slice(2, -2)}
            </pre>
          </AccordionDetails>
        </Accordion>
      )}
    </FormContext>
  )
}
