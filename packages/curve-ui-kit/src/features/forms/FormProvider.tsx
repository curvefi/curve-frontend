import { type ReactNode } from 'react'
import AccordionDetails from '@mui/material/AccordionDetails'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { isDevelopment } from '@ui-kit/utils'
import type { FieldValues, UseFormReturn } from './form.types'
import { FormContext } from './useFormContext'

export type FormProviderProps<T extends FieldValues> = UseFormReturn<T> & { children: ReactNode }
export const FormProvider = <T extends FieldValues>({ children, ...form }: FormProviderProps<T>) => (
  <FormContext.Provider value={form as UseFormReturn}>
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
