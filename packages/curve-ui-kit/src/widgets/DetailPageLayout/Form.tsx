import { type ReactNode } from 'react'
import { FormProvider } from '@ui-kit/features/forms'
import type { FieldValues, FormSubmitHandler, UseFormReturn } from '@ui-kit/features/forms'
import { FormContent } from './FormContent'

/**
 * A form element that includes a provider, a form tag, and a content wrapper.
 * Supports a footer below the form (outside the background area).
 */
export const Form = <TFieldValues extends FieldValues>({
  onSubmit,
  children,
  footer,
  ...form
}: {
  onSubmit: FormSubmitHandler
  children: ReactNode
  footer: ReactNode
} & UseFormReturn<TFieldValues>) => (
  <FormProvider {...form}>
    <form onSubmit={event => void onSubmit(event)} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={footer}>{children}</FormContent>
    </form>
  </FormProvider>
)
