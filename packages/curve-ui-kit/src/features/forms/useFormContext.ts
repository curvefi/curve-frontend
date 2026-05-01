import { createContext } from 'react'
import type { FieldValues, UseFormReturn } from './types'

export const FormContext = createContext<UseFormReturn | undefined>(undefined)

export const useFormContext = <T extends FieldValues = FieldValues>() => FormContext as unknown as UseFormReturn<T>
