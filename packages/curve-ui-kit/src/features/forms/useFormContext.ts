import { createContext, use } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'

export const FormContext = createContext<UseFormReturn | undefined>(undefined)

// eslint-disable-next-line @eslint-react/no-use-context -- Existing violation before enabling this rule.
export const useFormContext = <T extends FieldValues = FieldValues>() => use(FormContext) as UseFormReturn<T>
