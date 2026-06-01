import { createContext, use } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'

export const FormContext = createContext<UseFormReturn | undefined>(undefined)

export const useFormContext = <T extends FieldValues = FieldValues>() => use(FormContext) as UseFormReturn<T>
