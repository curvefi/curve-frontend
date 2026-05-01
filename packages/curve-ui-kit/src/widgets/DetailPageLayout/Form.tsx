import type { SubmitEventHandler, ReactNode } from 'react'
import { FormProvider } from '@ui-kit/forms'
import type { FieldValues, FormProviderProps } from '@ui-kit/forms'
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
  onSubmit: SubmitEventHandler<HTMLFormElement>
  children: ReactNode
  footer: ReactNode
} & FormProviderProps<TFieldValues>) => (
  <FormProvider {...form}>
    <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={footer}>{children}</FormContent>
    </form>
  </FormProvider>
)
