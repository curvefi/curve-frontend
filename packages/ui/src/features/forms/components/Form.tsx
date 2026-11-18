import { type ReactNode } from 'react'
import { FormProvider } from '@ui/features/forms'
import type { FieldValues, FormSubmitHandler, UseFormReturn } from '@ui/features/forms'
import { FormContainer } from './FormContainer'

/**
 * A form element that includes a provider, a form tag, and a content wrapper.
 * Supports a footer below the form (outside the background area).
 */
export const Form = <TFieldValues extends FieldValues>({
  onSubmit,
  children,
  footer,
  ...form
}: { onSubmit: FormSubmitHandler; children: ReactNode; footer: ReactNode } & UseFormReturn<TFieldValues>) => (
  <FormProvider {...form}>
    <FormContainer onSubmit={onSubmit} footer={footer}>
      {children}
    </FormContainer>
  </FormProvider>
)
