import type { FormEventHandler, ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { FieldValues, FormProviderProps } from 'react-hook-form'
import { FormContent } from './FormContent'

type TContext = null // not used yet, we can make this generic later if needed

/**
 * A form element that includes a provider, a form tag, and a content wrapper.
 * Supports a child info accordion below the form (outside the background area).
 */
export const Form = <TFieldValues extends FieldValues>({
  onSubmit,
  children,
  infoAccordion,
  ...form
}: {
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  infoAccordion: ReactNode
} & FormProviderProps<TFieldValues, TContext, TFieldValues>) => (
  <FormProvider {...form}>
    <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={infoAccordion}>{children}</FormContent>
    </form>
  </FormProvider>
)
