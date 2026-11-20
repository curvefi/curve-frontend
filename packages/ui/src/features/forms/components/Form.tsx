import { type ReactNode } from 'react'
import type { FieldValues, FormSubmitHandler, UseFormReturn } from '@ui/features/forms'
import { FormStateDebug } from '@ui/features/forms/FormStateDebug'
import { FormContent } from './FormContent'

/**
 * A form element with a content wrapper and development form state display.
 * Supports a footer below the form (outside the background area).
 */
export const Form = <TFieldValues extends FieldValues>({
  onSubmit,
  children,
  footer,
  ...form
}: { onSubmit: FormSubmitHandler; children: ReactNode; footer: ReactNode } & UseFormReturn<TFieldValues>) => (
  <>
    <form onSubmit={event => void onSubmit(event)} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={footer}>{children}</FormContent>
    </form>
    <FormStateDebug {...form} />
  </>
)
