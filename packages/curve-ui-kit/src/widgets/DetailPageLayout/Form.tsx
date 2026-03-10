import type { SubmitEventHandler, ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { FieldValues, FormProviderProps } from 'react-hook-form'
import { FormContent } from './FormContent'

type TContext = null // not used yet, we can make this generic later if needed

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
} & FormProviderProps<TFieldValues, TContext, TFieldValues>) => (
  <FormProvider {...form}>
    <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={footer}>{children}</FormContent>
    </form>
  </FormProvider>
)
