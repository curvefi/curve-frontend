import { createContext, useContext } from 'react'
import { assert } from '@primitives/objects.utils'
import type { FieldValues, UseFormReturn } from './form.types'

export const FormContext = createContext<UseFormReturn | undefined>(undefined)

export const useFormContext = <T extends FieldValues = FieldValues>() =>
  assert(useContext(FormContext), 'useFormContext must be used within a FormProvider') as UseFormReturn<T>
