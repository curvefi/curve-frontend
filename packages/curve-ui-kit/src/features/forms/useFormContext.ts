import { createContext, useContext } from 'react'
import type { FieldValues, UseFormReturn } from './form.types'

export const FormContext = createContext<UseFormReturn | undefined>(undefined)

export const useFormContext = <T extends FieldValues = FieldValues>() => useContext(FormContext) as UseFormReturn<T>
