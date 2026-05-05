import { type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'
import { FormContext } from './useFormContext'

export type FormProviderProps<T extends FieldValues> = UseFormReturn<T> & { children: ReactNode }
export const FormProvider = <T extends FieldValues>({ children, ...form }: FormProviderProps<T>) => (
  <FormContext.Provider value={form as UseFormReturn}>{children}</FormContext.Provider>
)
